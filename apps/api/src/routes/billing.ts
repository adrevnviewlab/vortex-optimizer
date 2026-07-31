import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { organizations } from "@vorzop/db";
import type { BillingCheckoutDto, BillingPortalDto, BillingStatusDto } from "@vorzop/shared";
import { getDb } from "../lib/db.js";
import { getEnv } from "../lib/env.js";
import { verifyApiJwt } from "../lib/jwt.js";
import { jsonWithMeta, readinessMiddleware } from "../lib/response.js";
import {
  checkoutModeForPlan,
  getStripeClient,
  isStripeLive,
  resolveStripePriceId,
  type CheckoutPlan,
} from "../lib/stripe-client.js";
import { authMiddleware, getUserId } from "../middleware/auth.js";

const checkoutSchema = z.object({
  plan: z.enum(["audit", "retainer", "quarterly", "enterprise"]).default("audit"),
  orgId: z.string().uuid().optional(),
});

function billingReadiness(): "live" | "stub" | "blocked" {
  return isStripeLive() ? "live" : "blocked";
}

async function resolveOrgId(c: {
  req: { header: (name: string) => string | undefined };
}): Promise<string | null> {
  return c.req.header("X-Org-Id") ?? null;
}

export const billingRoutes = new Hono();

billingRoutes.get("/status", readinessMiddleware("blocked"), async (c) => {
  const env = getEnv();
  const connected = isStripeLive();

  let plan: string | null = null;
  let portalAvailable = false;

  const authHeader = c.req.header("Authorization");
  const orgId = c.req.header("X-Org-Id");

  if (authHeader?.startsWith("Bearer ") && orgId) {
    try {
      await verifyApiJwt(authHeader.slice("Bearer ".length));
      const db = getDb();
      const rows = await db
        .select({
          stripeCustomerId: organizations.stripeCustomerId,
          settings: organizations.settings,
          tier: organizations.tier,
        })
        .from(organizations)
        .where(eq(organizations.id, orgId))
        .limit(1);

      const org = rows[0];
      if (org) {
        const settings = (org.settings ?? {}) as Record<string, unknown>;
        plan = (settings.billingPlan as string | undefined) ?? org.tier;
        portalAvailable = connected && Boolean(org.stripeCustomerId);
      }
    } catch {
      /* unauthenticated pricing page */
    }
  }

  const payload: BillingStatusDto = {
    connected,
    featureEnabled: env.FEATURE_STRIPE,
    message: connected
      ? "Stripe connected — checkout and customer portal available"
      : "Stripe not connected — contact sales for manual invoicing",
    plan,
    portalAvailable,
  };

  return jsonWithMeta(c, payload, billingReadiness());
});

billingRoutes.post("/checkout", authMiddleware, readinessMiddleware("blocked"), async (c) => {
  if (!isStripeLive()) {
    return c.json(
      {
        error: "Stripe checkout unavailable — billing not connected",
        meta: { readiness: "blocked" as const },
      },
      503,
      { "X-Readiness": "blocked" },
    );
  }

  const parsed = checkoutSchema.safeParse(await c.req.json().catch(() => ({})));
  if (!parsed.success) {
    return c.json(
      { error: "Invalid body", details: parsed.error.flatten(), meta: { readiness: "blocked" } },
      400,
    );
  }

  const orgId = parsed.data.orgId ?? (await resolveOrgId(c));
  if (!orgId) {
    return c.json(
      { error: "Organization context required (X-Org-Id)", meta: { readiness: "blocked" } },
      400,
    );
  }

  const plan = parsed.data.plan as CheckoutPlan;
  const priceId = resolveStripePriceId(plan);
  if (!priceId) {
    return c.json(
      {
        error: `Stripe price not configured for plan: ${plan}`,
        meta: { readiness: "stub" as const },
      },
      503,
    );
  }

  const stripe = getStripeClient()!;
  const env = getEnv();
  const userId = getUserId(c);

  const db = getDb();
  const orgRows = await db
    .select({
      stripeCustomerId: organizations.stripeCustomerId,
      name: organizations.name,
    })
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);

  const org = orgRows[0];
  if (!org) {
    return c.json({ error: "Organization not found", meta: { readiness: "blocked" } }, 404);
  }

  const session = await stripe.checkout.sessions.create({
    mode: checkoutModeForPlan(plan),
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${env.APP_URL}/settings?checkout=success`,
    cancel_url: `${env.APP_URL}/pricing?checkout=cancel`,
    client_reference_id: orgId,
    customer: org.stripeCustomerId ?? undefined,
    metadata: {
      orgId,
      plan,
      userId,
    },
  });

  const payload: BillingCheckoutDto = {
    checkoutUrl: session.url!,
    sessionId: session.id,
  };

  return jsonWithMeta(c, payload, "live");
});

billingRoutes.post("/portal", authMiddleware, readinessMiddleware("blocked"), async (c) => {
  if (!isStripeLive()) {
    return c.json(
      {
        error: "Stripe customer portal unavailable — billing not connected",
        meta: { readiness: "blocked" as const },
      },
      503,
    );
  }

  const orgId = await resolveOrgId(c);
  if (!orgId) {
    return c.json(
      { error: "Organization context required (X-Org-Id)", meta: { readiness: "blocked" } },
      400,
    );
  }

  const db = getDb();
  const orgRows = await db
    .select({ stripeCustomerId: organizations.stripeCustomerId })
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);

  const customerId = orgRows[0]?.stripeCustomerId;
  if (!customerId) {
    return c.json(
      {
        error: "No Stripe customer on file — complete checkout first",
        meta: { readiness: "stub" as const },
      },
      404,
    );
  }

  const stripe = getStripeClient()!;
  const env = getEnv();
  const portal = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${env.APP_URL}/settings`,
  });

  const payload: BillingPortalDto = { portalUrl: portal.url };
  return jsonWithMeta(c, payload, "live");
});

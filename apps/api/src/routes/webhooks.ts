import { eq } from "drizzle-orm";
import { Hono } from "hono";
import type Stripe from "stripe";
import { organizations } from "@vorzop/db";
import { getDb } from "../lib/db.js";
import { getEnv } from "../lib/env.js";
import { getStripeClient } from "../lib/stripe-client.js";
import { logAuditEvent } from "../lib/audit-events.js";

export const webhookRoutes = new Hono();

webhookRoutes.post("/stripe", async (c) => {
  const env = getEnv();
  const stripe = getStripeClient();

  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
    return c.json(
      { error: "Stripe webhooks not configured", meta: { readiness: "blocked" } },
      503,
    );
  }

  const signature = c.req.header("stripe-signature");
  if (!signature) {
    return c.json({ error: "Missing stripe-signature header", meta: { readiness: "blocked" } }, 400);
  }

  const rawBody = await c.req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return c.json({ error: message, meta: { readiness: "blocked" } }, 400);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orgId = session.metadata?.orgId ?? session.client_reference_id;
    const plan = session.metadata?.plan ?? "audit";
    const customerId =
      typeof session.customer === "string" ? session.customer : session.customer?.id;

    if (orgId && customerId) {
      const db = getDb();
      const orgRows = await db
        .select({ settings: organizations.settings })
        .from(organizations)
        .where(eq(organizations.id, orgId))
        .limit(1);

      const currentSettings = (orgRows[0]?.settings ?? {}) as Record<string, unknown>;
      const mergedSettings = {
        ...currentSettings,
        billingPlan: plan,
        billingStatus: "active",
        lastCheckoutAt: new Date().toISOString(),
      };

      await db
        .update(organizations)
        .set({
          stripeCustomerId: customerId,
          settings: mergedSettings,
          updatedAt: new Date(),
        })
        .where(eq(organizations.id, orgId));

      await logAuditEvent(db, {
        orgId,
        actorId: null,
        action: "billing.checkout.completed",
        resource: `stripe/session/${session.id}`,
        metadata: { plan, customer_id: customerId },
      });
    }
  }

  return c.json({ received: true, meta: { readiness: "live" } });
});

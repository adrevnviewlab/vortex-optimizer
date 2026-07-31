import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { graphConnections } from "@vorzop/db";
import type { MicrosoftIntegrationDto } from "@vorzop/shared";
import { getEnv } from "../lib/env.js";
import { getDb } from "../lib/db.js";
import {
  buildGraphAuthUrl,
  graphBlockedMessage,
  isGraphConfigured,
  signGraphOAuthState,
} from "../lib/graph-oauth.js";
import { getIntegrationStatuses } from "../lib/readiness.js";
import { jsonWithMeta, readinessMiddleware } from "../lib/response.js";
import { countSyncedRecords, runGraphSync } from "../jobs/graph-sync.js";
import { authMiddleware } from "../middleware/auth.js";
import { getOrgId, orgScopeMiddleware } from "../middleware/org.js";

export const integrationsRoutes = new Hono();

integrationsRoutes.use("*", authMiddleware);
integrationsRoutes.use("/:orgId/*", orgScopeMiddleware);

function blockedResponse(c: Parameters<typeof jsonWithMeta>[0], message?: string) {
  const env = getEnv();
  return c.json(
    {
      error: message ?? graphBlockedMessage(env),
      meta: { readiness: "blocked" as const },
    },
    503,
    { "X-Readiness": "blocked" },
  );
}

async function getMicrosoftIntegration(orgId: string): Promise<MicrosoftIntegrationDto> {
  const env = getEnv();
  const configured = isGraphConfigured(env);

  if (!configured) {
    return {
      featureEnabled: env.FEATURE_GRAPH_SYNC,
      configured: false,
      connected: false,
      status: "blocked",
      message: graphBlockedMessage(env),
    };
  }

  const db = getDb();
  const [connection] = await db
    .select({
      tenantId: graphConnections.tenantId,
      status: graphConnections.status,
      lastSyncAt: graphConnections.lastSyncAt,
      lastError: graphConnections.lastError,
      consentedAt: graphConnections.consentedAt,
    })
    .from(graphConnections)
    .where(eq(graphConnections.orgId, orgId))
    .limit(1);

  if (!connection || connection.status === "disconnected") {
    return {
      featureEnabled: true,
      configured: true,
      connected: false,
      status: "stub",
      message: "Connect Microsoft 365 to sync users and licenses automatically",
    };
  }

  const counts = await countSyncedRecords(orgId);

  return {
    featureEnabled: true,
    configured: true,
    connected: connection.status === "active",
    status: connection.status === "error" ? "stub" : "live",
    tenantId: connection.tenantId,
    lastSyncAt: connection.lastSyncAt?.toISOString() ?? null,
    lastError: connection.lastError,
    consentedAt: connection.consentedAt?.toISOString() ?? null,
    syncedUsers: counts.users,
    syncedLicenses: counts.licenses,
    message:
      connection.status === "error"
        ? (connection.lastError ?? "Last sync failed — try re-sync")
        : undefined,
  };
}

integrationsRoutes.get("/:orgId/integrations", async (c) => {
  const orgId = getOrgId(c);
  const integrations = await getIntegrationStatuses();
  const microsoft = await getMicrosoftIntegration(orgId);

  return jsonWithMeta(
    c,
    {
      microsoft,
      storage: integrations.storage,
      email: integrations.email,
      pdf: integrations.pdf,
      message:
        microsoft.connected
          ? "Microsoft Graph sync active — CSV import remains available as fallback"
          : "CSV import is the live data path until Microsoft Graph is connected",
    },
    microsoft.status,
  );
});

integrationsRoutes.get(
  "/:orgId/integrations/microsoft/auth-url",
  readinessMiddleware("blocked"),
  async (c) => {
    const env = getEnv();
    if (!isGraphConfigured(env)) {
      return blockedResponse(c);
    }

    const orgId = getOrgId(c);
    const state = await signGraphOAuthState(orgId);
    const authUrl = buildGraphAuthUrl(env, state);

    return jsonWithMeta(c, { authUrl, state }, "live");
  },
);

integrationsRoutes.delete(
  "/:orgId/integrations/microsoft",
  readinessMiddleware("blocked"),
  async (c) => {
    const env = getEnv();
    if (!isGraphConfigured(env)) {
      return blockedResponse(c);
    }

    const orgId = getOrgId(c);
    const db = getDb();

    await db.delete(graphConnections).where(eq(graphConnections.orgId, orgId));

    return jsonWithMeta(c, { disconnected: true }, "live");
  },
);

integrationsRoutes.post(
  "/:orgId/integrations/microsoft/sync",
  readinessMiddleware("blocked"),
  async (c) => {
    const env = getEnv();
    if (!isGraphConfigured(env)) {
      return blockedResponse(c);
    }

    const orgId = getOrgId(c);

    try {
      const result = await runGraphSync(orgId, "full");
      return jsonWithMeta(c, result, "live");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sync failed";
      return c.json(
        {
          error: message,
          meta: { readiness: "stub" as const },
        },
        503,
        { "X-Readiness": "stub" },
      );
    }
  },
);

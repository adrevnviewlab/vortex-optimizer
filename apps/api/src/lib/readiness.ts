import type { IntegrationKey, ReadinessLevel } from "@vorzop/shared";
import { getEnv } from "./env.js";
import { checkDbConnection } from "./db.js";

export type IntegrationStatus = {
  status: ReadinessLevel;
  message?: string;
};

export async function getIntegrationStatuses(): Promise<
  Record<IntegrationKey, IntegrationStatus>
> {
  const env = getEnv();
  const dbOk = await checkDbConnection();

  const storageConfigured = Boolean(env.S3_BUCKET && env.S3_ACCESS_KEY_ID);
  const emailConfigured = Boolean(env.RESEND_API_KEY);
  const graphConfigured = Boolean(
    env.GRAPH_CLIENT_ID &&
      env.GRAPH_CLIENT_SECRET &&
      env.GRAPH_REDIRECT_URI &&
      env.FEATURE_GRAPH_SYNC,
  );

  return {
    database: dbOk
      ? { status: "live" }
      : { status: "blocked", message: "Database connection failed" },
    auth: { status: "live" },
    storage: storageConfigured
      ? { status: "live", message: "S3/R2 configured for report uploads" }
      : {
          status: "stub",
          message: "Filesystem dev fallback — set S3_* for production object storage",
        },
    email: emailConfigured
      ? { status: "stub", message: "Resend configured but email routes not implemented" }
      : { status: "stub", message: "Email not configured" },
    graph: graphConfigured
      ? { status: "live", message: "OAuth + sync implemented — connect a tenant in Settings" }
      : { status: "blocked", message: "Microsoft Graph not enabled or OAuth not configured" },
    stripe:
      env.STRIPE_CONNECTED && env.FEATURE_STRIPE && env.STRIPE_SECRET_KEY
        ? { status: "live", message: "Stripe checkout and webhooks available" }
        : { status: "blocked", message: "Stripe not connected" },
    pdf: { status: "live", message: "PDF report generation with signed download" },
  };
}

export async function getOverallReadiness(): Promise<ReadinessLevel> {
  const integrations = await getIntegrationStatuses();
  const statuses = Object.values(integrations).map((i) => i.status);

  if (statuses.includes("blocked")) {
    const db = integrations.database.status;
    return db === "blocked" ? "blocked" : "stub";
  }

  if (statuses.every((s) => s === "live")) return "live";
  return "stub";
}

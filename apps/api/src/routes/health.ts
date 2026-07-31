import { Hono } from "hono";
import { jsonWithMeta, readinessMiddleware } from "../lib/response.js";
import { getIntegrationStatuses, getOverallReadiness } from "../lib/readiness.js";
import { checkDbConnection } from "../lib/db.js";

export const healthRoutes = new Hono();

healthRoutes.get("/health", readinessMiddleware("live"), (c) => {
  return jsonWithMeta(c, { status: "ok", timestamp: new Date().toISOString() });
});

healthRoutes.get("/ready", readinessMiddleware("live"), async (c) => {
  const integrations = await getIntegrationStatuses();
  const overall = await getOverallReadiness();
  const dbOk = await checkDbConnection();

  return jsonWithMeta(
    c,
    {
      status: dbOk ? "ready" : "degraded",
      readiness: overall,
      integrations,
    },
    overall,
  );
});

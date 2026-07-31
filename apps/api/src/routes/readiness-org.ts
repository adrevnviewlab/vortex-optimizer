import { Hono } from "hono";
import { buildReadinessChecklist } from "@vorzop/shared";
import { getIntegrationStatuses } from "../lib/readiness.js";
import { jsonWithMeta, readinessMiddleware } from "../lib/response.js";
import { authMiddleware } from "../middleware/auth.js";
import { orgScopeMiddleware } from "../middleware/org.js";

export const orgReadinessRoutes = new Hono();

orgReadinessRoutes.use("*", authMiddleware);
orgReadinessRoutes.use("/:orgId/*", orgScopeMiddleware);

orgReadinessRoutes.get("/:orgId/readiness", readinessMiddleware("live"), async (c) => {
  const integrations = await getIntegrationStatuses();
  const modules = buildReadinessChecklist();

  return jsonWithMeta(c, {
    integrations,
    modules,
  });
});

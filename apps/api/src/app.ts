import { Hono } from "hono";

import { cors } from "hono/cors";

import { logger } from "hono/logger";

import { getEnv } from "./lib/env.js";

import { errorHandler } from "./middleware/error-handler.js";
import { securityHeadersMiddleware } from "./middleware/security-headers.js";
import { authRateLimitMiddleware } from "./middleware/rate-limit.js";
import { csrfMiddleware } from "./middleware/csrf.js";

import { healthRoutes } from "./routes/health.js";

import { authRoutes } from "./routes/auth.js";

import { meRoutes, orgRoutes } from "./routes/me.js";

import { dashboardRoutes } from "./routes/dashboard.js";

import { auditRoutes } from "./routes/audits.js";

import { clientRoutes } from "./routes/clients.js";

import { auditAnalysisRoutes } from "./routes/audit-analysis.js";

import { settingsRoutes } from "./routes/settings.js";

import { membersRoutes } from "./routes/members.js";

import { orgReadinessRoutes } from "./routes/readiness-org.js";

import { auditEventsRoutes } from "./routes/audit-events.js";

import { renewalRoutes } from "./routes/renewal.js";

import { reportRoutes } from "./routes/reports.js";

import { demoRoutes } from "./routes/demo.js";

import { integrationsRoutes } from "./routes/integrations.js";

import { graphCallbackRoutes } from "./routes/graph-callback.js";

import { billingRoutes } from "./routes/billing.js";

import { webhookRoutes } from "./routes/webhooks.js";



export function createApp() {

  const env = getEnv();

  const app = new Hono();



  app.use("*", logger());

  app.use("*", securityHeadersMiddleware);

  app.use(

    "*",

    cors({

      origin: env.APP_URL,

      allowHeaders: ["Authorization", "Content-Type", "X-Org-Id"],

      exposeHeaders: ["X-Readiness"],

      credentials: true,

    }),

  );



  app.route("/", healthRoutes);

  app.use("/v1/*", csrfMiddleware);

  app.use("/v1/auth/*", authRateLimitMiddleware);

  app.route("/v1/auth", authRoutes);

  app.route("/v1", meRoutes);

  app.route("/v1", orgRoutes);

  app.route("/v1/orgs", dashboardRoutes);

  app.route("/v1/orgs", auditRoutes);

  app.route("/v1/orgs", auditAnalysisRoutes);

  app.route("/v1/orgs", clientRoutes);

  app.route("/v1/orgs", settingsRoutes);

  app.route("/v1/orgs", membersRoutes);

  app.route("/v1/orgs", orgReadinessRoutes);

  app.route("/v1/orgs", auditEventsRoutes);

  app.route("/v1/orgs", renewalRoutes);

  app.route("/v1/orgs", reportRoutes);

  app.route("/v1/orgs", integrationsRoutes);

  app.route("/v1/integrations", graphCallbackRoutes);

  app.route("/v1/demo", demoRoutes);

  app.route("/v1/billing", billingRoutes);

  app.route("/v1/webhooks", webhookRoutes);



  app.onError(errorHandler);



  app.notFound((c) =>

    c.json({ error: "Not found", meta: { readiness: "live" } }, 404),

  );



  return app;

}


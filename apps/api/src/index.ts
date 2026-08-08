import "dotenv/config";
import { serve } from "@hono/node-server";
import { createApp } from "./app.js";
import { getEnv } from "./lib/env.js";
import { initSentry } from "./lib/sentry.js";

initSentry();

const env = getEnv();
const app = createApp();
const port = env.PORT;
const hostname = "0.0.0.0";

console.log(`Starting Vortex Optimizer API on ${hostname}:${port}`);

serve({ fetch: app.fetch, port, hostname }, (info) => {
  console.log(`API listening on http://${info.address}:${info.port}`);
});

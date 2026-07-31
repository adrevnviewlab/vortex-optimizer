import { Hono } from "hono";
import { getEnv } from "../lib/env.js";
import {
  exchangeAuthorizationCode,
  graphBlockedMessage,
  isGraphConfigured,
  verifyGraphOAuthState,
} from "../lib/graph-oauth.js";
import {
  resolveTenantIdFromToken,
  runGraphSync,
  upsertGraphConnection,
} from "../jobs/graph-sync.js";

export const graphCallbackRoutes = new Hono();

graphCallbackRoutes.get("/microsoft/callback", async (c) => {
  const env = getEnv();

  if (!isGraphConfigured(env)) {
    return c.json(
      { error: graphBlockedMessage(env), meta: { readiness: "blocked" as const } },
      503,
      { "X-Readiness": "blocked" },
    );
  }

  const error = c.req.query("error");
  const errorDescription = c.req.query("error_description");
  if (error) {
    const redirect = `${env.APP_URL}/settings?graph=error&message=${encodeURIComponent(errorDescription ?? error)}`;
    return c.redirect(redirect, 302);
  }

  const adminConsent = c.req.query("admin_consent");
  const state = c.req.query("state");
  const code = c.req.query("code");
  const tenantFromQuery = c.req.query("tenant");

  if (adminConsent === "True" && state && !code) {
    try {
      await verifyGraphOAuthState(state);
      const redirect = `${env.APP_URL}/settings?graph=consent_pending`;
      return c.redirect(redirect, 302);
    } catch {
      const redirect = `${env.APP_URL}/settings?graph=error&message=${encodeURIComponent("Invalid OAuth state")}`;
      return c.redirect(redirect, 302);
    }
  }

  if (!code || !state) {
    const redirect = `${env.APP_URL}/settings?graph=error&message=${encodeURIComponent("Missing authorization code")}`;
    return c.redirect(redirect, 302);
  }

  try {
    const { orgId } = await verifyGraphOAuthState(state);
    const tokens = await exchangeAuthorizationCode(env, code);
    const tenantId =
      tenantFromQuery ?? tokens.tenant_id ?? (await resolveTenantIdFromToken(tokens.access_token));
    const scopes = tokens.scope.split(" ").filter(Boolean);

    await upsertGraphConnection({
      orgId,
      tenantId,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
      scopes,
    });

    try {
      await runGraphSync(orgId, "full");
    } catch {
      // Connection is stored; initial sync failure is surfaced on settings page
    }

    const redirect = `${env.APP_URL}/settings?graph=connected`;
    return c.redirect(redirect, 302);
  } catch (err) {
    const message = err instanceof Error ? err.message : "OAuth callback failed";
    const redirect = `${env.APP_URL}/settings?graph=error&message=${encodeURIComponent(message)}`;
    return c.redirect(redirect, 302);
  }
});

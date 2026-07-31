import { SignJWT, jwtVerify } from "jose";
import { GRAPH_SYNC_SCOPES } from "@vorzop/shared";
import type { Env } from "./env.js";
import { getJwtSecret } from "./env.js";

const OAUTH_STATE_TTL_SECONDS = 15 * 60;
const OAUTH_STATE_ISSUER = "vorzop-graph-oauth";

export type GraphOAuthState = {
  orgId: string;
  nonce: string;
};

function getStateKey() {
  return new TextEncoder().encode(getJwtSecret());
}

export async function signGraphOAuthState(orgId: string): Promise<string> {
  const nonce = crypto.randomUUID();
  return new SignJWT({ orgId, nonce })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(OAUTH_STATE_ISSUER)
    .setIssuedAt()
    .setExpirationTime(`${OAUTH_STATE_TTL_SECONDS}s`)
    .sign(getStateKey());
}

export async function verifyGraphOAuthState(state: string): Promise<GraphOAuthState> {
  const { payload } = await jwtVerify(state, getStateKey(), {
    issuer: OAUTH_STATE_ISSUER,
  });

  if (typeof payload.orgId !== "string" || typeof payload.nonce !== "string") {
    throw new Error("Invalid OAuth state payload");
  }

  return { orgId: payload.orgId, nonce: payload.nonce };
}

export function buildGraphAuthUrl(env: Env, state: string): string {
  if (!env.GRAPH_CLIENT_ID || !env.GRAPH_REDIRECT_URI) {
    throw new Error("Graph OAuth is not configured");
  }

  const params = new URLSearchParams({
    client_id: env.GRAPH_CLIENT_ID,
    response_type: "code",
    redirect_uri: env.GRAPH_REDIRECT_URI,
    response_mode: "query",
    scope: GRAPH_SYNC_SCOPES.join(" "),
    state,
    prompt: "admin_consent",
  });

  return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
}

export type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  token_type: string;
  tenant_id?: string;
};

export async function exchangeAuthorizationCode(
  env: Env,
  code: string,
): Promise<TokenResponse> {
  if (!env.GRAPH_CLIENT_ID || !env.GRAPH_CLIENT_SECRET || !env.GRAPH_REDIRECT_URI) {
    throw new Error("Graph OAuth is not configured");
  }

  const body = new URLSearchParams({
    client_id: env.GRAPH_CLIENT_ID,
    client_secret: env.GRAPH_CLIENT_SECRET,
    grant_type: "authorization_code",
    code,
    redirect_uri: env.GRAPH_REDIRECT_URI,
  });

  const res = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed (${res.status}): ${text}`);
  }

  return (await res.json()) as TokenResponse;
}

export async function refreshAccessToken(
  env: Env,
  refreshToken: string,
): Promise<TokenResponse> {
  if (!env.GRAPH_CLIENT_ID || !env.GRAPH_CLIENT_SECRET || !env.GRAPH_REDIRECT_URI) {
    throw new Error("Graph OAuth is not configured");
  }

  const body = new URLSearchParams({
    client_id: env.GRAPH_CLIENT_ID,
    client_secret: env.GRAPH_CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    redirect_uri: env.GRAPH_REDIRECT_URI,
  });

  const res = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token refresh failed (${res.status}): ${text}`);
  }

  return (await res.json()) as TokenResponse;
}

export function isGraphConfigured(env: Env): boolean {
  return Boolean(
    env.FEATURE_GRAPH_SYNC &&
      env.GRAPH_CLIENT_ID &&
      env.GRAPH_CLIENT_SECRET &&
      env.GRAPH_REDIRECT_URI,
  );
}

export function graphBlockedMessage(env: Env): string {
  if (!env.FEATURE_GRAPH_SYNC) {
    return "Microsoft Graph sync is disabled — set FEATURE_GRAPH_SYNC=true to enable";
  }
  if (!env.GRAPH_CLIENT_ID || !env.GRAPH_CLIENT_SECRET || !env.GRAPH_REDIRECT_URI) {
    return "Microsoft Graph OAuth is not configured — set GRAPH_CLIENT_ID, GRAPH_CLIENT_SECRET, and GRAPH_REDIRECT_URI";
  }
  return "Microsoft Graph sync unavailable";
}

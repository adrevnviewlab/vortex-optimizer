import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { getEnv } from "../lib/env.js";

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function requestOrigin(c: Context): string | null {
  const origin = c.req.header("Origin");
  if (origin) return origin;

  const referer = c.req.header("Referer");
  if (!referer) return null;

  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}

/**
 * Rejects cross-origin state-changing requests when Origin/Referer is present.
 * Server-to-server calls (no Origin) are allowed; protected routes still require JWT.
 */
export async function csrfMiddleware(c: Context, next: Next) {
  if (!MUTATION_METHODS.has(c.req.method)) {
    await next();
    return;
  }

  const origin = requestOrigin(c);
  if (!origin) {
    await next();
    return;
  }

  const allowed = new URL(getEnv().APP_URL).origin;
  if (origin !== allowed) {
    throw new HTTPException(403, { message: "Cross-origin mutation rejected" });
  }

  await next();
}

import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;

function getClientKey(c: Context): string {
  return (
    c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
    c.req.header("x-real-ip") ??
    "unknown"
  );
}

export async function authRateLimitMiddleware(c: Context, next: Next) {
  const key = getClientKey(c);
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    await next();
    return;
  }

  if (bucket.count >= MAX_REQUESTS) {
    throw new HTTPException(429, { message: "Too many auth requests. Try again shortly." });
  }

  bucket.count += 1;
  await next();
}

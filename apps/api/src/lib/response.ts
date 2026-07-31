import type { ReadinessLevel } from "@vorzop/shared";
import type { Context, Next } from "hono";

export function setReadiness(c: Context, level: ReadinessLevel) {
  c.header("X-Readiness", level);
  c.set("readiness", level);
}

export function readinessMiddleware(defaultLevel: ReadinessLevel = "live") {
  return async (c: Context, next: Next) => {
    setReadiness(c, defaultLevel);
    await next();
  };
}

export function jsonWithMeta<T>(
  c: Context,
  data: T,
  readiness?: ReadinessLevel,
) {
  const level = readiness ?? (c.get("readiness") as ReadinessLevel | undefined) ?? "live";
  setReadiness(c, level);
  return c.json({ data, meta: { readiness: level } });
}

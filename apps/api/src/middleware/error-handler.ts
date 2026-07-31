import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { ZodError } from "zod";

export function errorHandler(err: Error, c: Context) {
  if (err instanceof HTTPException) {
    return c.json(
      {
        error: err.message,
        meta: { readiness: "live" as const },
      },
      err.status,
    );
  }

  if (err instanceof ZodError) {
    return c.json(
      {
        error: "Validation failed",
        details: err.flatten(),
        meta: { readiness: "live" as const },
      },
      400,
    );
  }

  console.error(err);

  return c.json(
    {
      error: "Internal server error",
      meta: { readiness: "live" as const },
    },
    500 satisfies ContentfulStatusCode,
  );
}

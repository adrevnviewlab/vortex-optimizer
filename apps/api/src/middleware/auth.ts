import type { OrgRole } from "@vorzop/shared";
import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { verifyApiJwt } from "../lib/jwt.js";

export type AuthVariables = {
  userId: string;
  orgId?: string;
  role?: OrgRole;
};

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new HTTPException(401, { message: "Missing or invalid Authorization header" });
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    const payload = await verifyApiJwt(token);
    c.set("userId", payload.sub);
    if (payload.orgId) c.set("orgId", payload.orgId);
    if (payload.role) c.set("role", payload.role);
    await next();
  } catch {
    throw new HTTPException(401, { message: "Invalid or expired token" });
  }
}

export function getUserId(c: Context): string {
  const userId = c.get("userId") as string | undefined;
  if (!userId) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }
  return userId;
}

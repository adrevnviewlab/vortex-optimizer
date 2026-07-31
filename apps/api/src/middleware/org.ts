import { and, eq } from "drizzle-orm";
import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { organizationMembers } from "@vorzop/db";
import { getDb } from "../lib/db.js";
import { getUserId } from "./auth.js";

export async function orgScopeMiddleware(c: Context, next: Next) {
  const orgId = c.req.param("orgId");
  if (!orgId) {
    throw new HTTPException(400, { message: "Missing orgId parameter" });
  }

  const headerOrgId = c.req.header("X-Org-Id");
  if (headerOrgId && headerOrgId !== orgId) {
    throw new HTTPException(403, { message: "X-Org-Id header does not match route orgId" });
  }

  const userId = getUserId(c);
  const db = getDb();

  const membership = await db
    .select({
      role: organizationMembers.role,
    })
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.orgId, orgId),
        eq(organizationMembers.userId, userId),
      ),
    )
    .limit(1);

  if (membership.length === 0) {
    throw new HTTPException(403, { message: "Not a member of this organization" });
  }

  c.set("orgId", orgId);
  c.set("role", membership[0]!.role);
  await next();
}

export function getOrgId(c: Context): string {
  const orgId = c.get("orgId") as string | undefined;
  if (!orgId) {
    throw new HTTPException(403, { message: "Organization context required" });
  }
  return orgId;
}

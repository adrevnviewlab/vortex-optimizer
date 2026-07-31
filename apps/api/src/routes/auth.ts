import { and, eq, gt } from "drizzle-orm";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { sessions, organizationMembers } from "@vorzop/db";
import { sessionBridgeSchema, type OrgRole } from "@vorzop/shared";
import { HTTPException } from "hono/http-exception";
import { getDb } from "../lib/db.js";
import { signApiJwt } from "../lib/jwt.js";
import { jsonWithMeta, readinessMiddleware } from "../lib/response.js";

export const authRoutes = new Hono();

authRoutes.post(
  "/session-bridge",
  readinessMiddleware("live"),
  zValidator("json", sessionBridgeSchema),
  async (c) => {
    const { sessionToken, activeOrgId } = c.req.valid("json");
    const db = getDb();

    const sessionRows = await db
      .select({
        userId: sessions.userId,
        expires: sessions.expires,
      })
      .from(sessions)
      .where(
        and(
          eq(sessions.sessionToken, sessionToken),
          gt(sessions.expires, new Date()),
        ),
      )
      .limit(1);

    if (sessionRows.length === 0) {
      throw new HTTPException(401, { message: "Invalid or expired session" });
    }

    const userId = sessionRows[0]!.userId;
    let orgId = activeOrgId;
    let role: string | undefined;

    if (orgId) {
      const membership = await db
        .select({ role: organizationMembers.role })
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.userId, userId),
            eq(organizationMembers.orgId, orgId),
          ),
        )
        .limit(1);

      if (membership.length === 0) {
        throw new HTTPException(403, { message: "Not a member of requested organization" });
      }

      role = membership[0]!.role;
    }

    const { token, expiresAt } = await signApiJwt({
      sub: userId,
      orgId,
      role: role as OrgRole | undefined,
    });

    return jsonWithMeta(c, {
      token,
      expiresAt: expiresAt.toISOString(),
      userId,
    });
  },
);

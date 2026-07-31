import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  generateToken,
  hashToken,
  organizationInvites,
  organizationMembers,
  users,
} from "@vorzop/db";
import {
  createInviteSchema,
  createMemberSchema,
  patchMemberSchema,
  type OrgInviteDto,
  type OrgMemberDto,
} from "@vorzop/shared";
import { getDb } from "../lib/db.js";
import { logAuditEvent } from "../lib/audit-events.js";
import { jsonWithMeta, readinessMiddleware } from "../lib/response.js";
import { authMiddleware, getUserId } from "../middleware/auth.js";
import { getOrgId, orgScopeMiddleware } from "../middleware/org.js";

export const membersRoutes = new Hono();

membersRoutes.use("*", authMiddleware);
membersRoutes.use("/:orgId/*", orgScopeMiddleware);

membersRoutes.get("/:orgId/members", readinessMiddleware("live"), async (c) => {
  const orgId = getOrgId(c);
  const db = getDb();

  const rows = await db
    .select({
      userId: users.id,
      email: users.email,
      name: users.name,
      role: organizationMembers.role,
      joinedAt: organizationMembers.joinedAt,
      invitedAt: organizationMembers.invitedAt,
    })
    .from(organizationMembers)
    .innerJoin(users, eq(users.id, organizationMembers.userId))
    .where(eq(organizationMembers.orgId, orgId));

  const payload: OrgMemberDto[] = rows.map((r) => ({
    userId: r.userId,
    email: r.email,
    name: r.name,
    role: r.role,
    joinedAt: r.joinedAt?.toISOString() ?? null,
    invitedAt: r.invitedAt?.toISOString() ?? null,
  }));

  return jsonWithMeta(c, payload);
});

membersRoutes.post(
  "/:orgId/members",
  readinessMiddleware("live"),
  zValidator("json", createMemberSchema),
  async (c) => {
    const orgId = getOrgId(c);
    const actorId = getUserId(c);
    const input = c.req.valid("json");
    const db = getDb();

    const userRows = await db
      .select()
      .from(users)
      .where(eq(users.email, input.email.toLowerCase()))
      .limit(1);

    if (userRows.length === 0) {
      return c.json(
        {
          error: "User not found — send an invite instead",
          meta: { readiness: "live" },
        },
        404,
      );
    }

    const user = userRows[0]!;
    const existing = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.orgId, orgId),
          eq(organizationMembers.userId, user.id),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      return c.json({ error: "User is already a member", meta: { readiness: "live" } }, 409);
    }

    await db.insert(organizationMembers).values({
      orgId,
      userId: user.id,
      role: input.role,
      joinedAt: new Date(),
    });

    await logAuditEvent(db, {
      orgId,
      actorId,
      action: "member.added",
      resource: `members/${user.id}`,
      metadata: { email: input.email, role: input.role },
    });

    const payload: OrgMemberDto = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: input.role,
      joinedAt: new Date().toISOString(),
      invitedAt: null,
    };

    return c.json({ data: payload, meta: { readiness: "live" } }, 201);
  },
);

membersRoutes.patch(
  "/:orgId/members/:userId",
  readinessMiddleware("live"),
  zValidator("json", patchMemberSchema),
  async (c) => {
    const orgId = getOrgId(c);
    const targetUserId = c.req.param("userId")!;
    const actorId = getUserId(c);
    const input = c.req.valid("json");
    const db = getDb();

    const updated = await db
      .update(organizationMembers)
      .set({ role: input.role })
      .where(
        and(
          eq(organizationMembers.orgId, orgId),
          eq(organizationMembers.userId, targetUserId),
        ),
      )
      .returning();

    if (updated.length === 0) {
      return c.json({ error: "Member not found", meta: { readiness: "live" } }, 404);
    }

    await logAuditEvent(db, {
      orgId,
      actorId,
      action: "member.role_updated",
      resource: `members/${targetUserId}`,
      metadata: { role: input.role },
    });

    const userRows = await db
      .select()
      .from(users)
      .where(eq(users.id, targetUserId))
      .limit(1);

    const user = userRows[0]!;

    return jsonWithMeta(c, {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: input.role,
      joinedAt: updated[0]!.joinedAt?.toISOString() ?? null,
      invitedAt: updated[0]!.invitedAt?.toISOString() ?? null,
    } satisfies OrgMemberDto);
  },
);

membersRoutes.post(
  "/:orgId/invites",
  readinessMiddleware("live"),
  zValidator("json", createInviteSchema),
  async (c) => {
    const orgId = getOrgId(c);
    const actorId = getUserId(c);
    const input = c.req.valid("json");
    const db = getDb();

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const [invite] = await db
      .insert(organizationInvites)
      .values({
        orgId,
        email: input.email.toLowerCase(),
        role: input.role,
        tokenHash: hashToken(token),
        expiresAt,
        invitedBy: actorId,
      })
      .returning();

    await logAuditEvent(db, {
      orgId,
      actorId,
      action: "invite.created",
      resource: `invites/${invite!.id}`,
      metadata: { email: input.email, role: input.role },
    });

    const payload: OrgInviteDto = {
      id: invite!.id,
      email: invite!.email,
      role: invite!.role,
      expiresAt: invite!.expiresAt.toISOString(),
      token,
    };

    return c.json({ data: payload, meta: { readiness: "live" } }, 201);
  },
);

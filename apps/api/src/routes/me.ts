import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { organizationMembers, organizations, users } from "@vorzop/db";
import type { MeDto, OrganizationDto } from "@vorzop/shared";
import { getDb } from "../lib/db.js";
import { jsonWithMeta, readinessMiddleware } from "../lib/response.js";
import { authMiddleware, getUserId } from "../middleware/auth.js";

export const meRoutes = new Hono();

meRoutes.use("*", authMiddleware);

meRoutes.get("/me", readinessMiddleware("live"), async (c) => {
  const userId = getUserId(c);
  const db = getDb();

  const userRows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      image: users.image,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (userRows.length === 0) {
    return c.json({ error: "User not found", meta: { readiness: "live" } }, 404);
  }

  const user = userRows[0]!;

  const memberships = await db
    .select({
      orgId: organizationMembers.orgId,
      role: organizationMembers.role,
      joinedAt: organizationMembers.joinedAt,
    })
    .from(organizationMembers)
    .where(eq(organizationMembers.userId, userId));

  const activeOrgId =
    c.req.header("X-Org-Id") ?? memberships[0]?.orgId ?? null;

  const payload: MeDto = {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      createdAt: user.createdAt.toISOString(),
    },
    memberships: memberships.map((m) => ({
      orgId: m.orgId,
      role: m.role,
      joinedAt: m.joinedAt?.toISOString() ?? null,
    })),
    activeOrgId,
  };

  return jsonWithMeta(c, payload);
});

export const orgRoutes = new Hono();

orgRoutes.use("*", authMiddleware);

orgRoutes.get("/orgs", readinessMiddleware("live"), async (c) => {
  const userId = getUserId(c);
  const db = getDb();

  const rows = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      region: organizations.region,
      tier: organizations.tier,
      settings: organizations.settings,
      createdAt: organizations.createdAt,
      updatedAt: organizations.updatedAt,
    })
    .from(organizations)
    .innerJoin(organizationMembers, eq(organizationMembers.orgId, organizations.id))
    .where(eq(organizationMembers.userId, userId));

  const payload: OrganizationDto[] = rows.map((org) => ({
    id: org.id,
    name: org.name,
    slug: org.slug,
    region: org.region,
    tier: org.tier,
    settings: (org.settings ?? {}) as Record<string, unknown>,
    createdAt: org.createdAt.toISOString(),
    updatedAt: org.updatedAt.toISOString(),
  }));

  return jsonWithMeta(c, payload);
});

orgRoutes.get("/orgs/:orgId", readinessMiddleware("live"), async (c) => {
  const userId = getUserId(c);
  const orgId = c.req.param("orgId");
  if (!orgId) {
    return c.json({ error: "Missing orgId", meta: { readiness: "live" } }, 400);
  }
  const db = getDb();

  const membership = await db
    .select({ orgId: organizationMembers.orgId })
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.userId, userId),
        eq(organizationMembers.orgId, orgId),
      ),
    )
    .limit(1);

  if (membership.length === 0) {
    return c.json({ error: "Not a member of this organization", meta: { readiness: "live" } }, 403);
  }

  const orgRows = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);

  if (orgRows.length === 0) {
    return c.json({ error: "Organization not found", meta: { readiness: "live" } }, 404);
  }

  const org = orgRows[0]!;

  const payload: OrganizationDto = {
    id: org.id,
    name: org.name,
    slug: org.slug,
    region: org.region,
    tier: org.tier,
    settings: (org.settings ?? {}) as Record<string, unknown>,
    createdAt: org.createdAt.toISOString(),
    updatedAt: org.updatedAt.toISOString(),
  };

  return jsonWithMeta(c, payload);
});

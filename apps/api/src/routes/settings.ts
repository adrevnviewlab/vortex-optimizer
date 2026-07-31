import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { organizations } from "@vorzop/db";
import { orgSettingsSchema, patchOrgSettingsSchema } from "@vorzop/shared";
import { getDb } from "../lib/db.js";
import { logAuditEvent } from "../lib/audit-events.js";
import { jsonWithMeta, readinessMiddleware } from "../lib/response.js";
import { authMiddleware, getUserId } from "../middleware/auth.js";
import { getOrgId, orgScopeMiddleware } from "../middleware/org.js";

export const settingsRoutes = new Hono();

settingsRoutes.use("*", authMiddleware);
settingsRoutes.use("/:orgId/*", orgScopeMiddleware);

settingsRoutes.get("/:orgId/settings", readinessMiddleware("live"), async (c) => {
  const orgId = getOrgId(c);
  const db = getDb();

  const rows = await db
    .select({ settings: organizations.settings, region: organizations.region })
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);

  if (rows.length === 0) {
    return c.json({ error: "Organization not found", meta: { readiness: "live" } }, 404);
  }

  const settings = orgSettingsSchema.parse(rows[0]!.settings ?? {});
  return jsonWithMeta(c, {
    ...settings,
    region: rows[0]!.region,
  });
});

settingsRoutes.patch(
  "/:orgId/settings",
  readinessMiddleware("live"),
  zValidator("json", patchOrgSettingsSchema),
  async (c) => {
    const orgId = getOrgId(c);
    const actorId = getUserId(c);
    const patch = c.req.valid("json");
    const db = getDb();

    const rows = await db
      .select({ settings: organizations.settings })
      .from(organizations)
      .where(eq(organizations.id, orgId))
      .limit(1);

    if (rows.length === 0) {
      return c.json({ error: "Organization not found", meta: { readiness: "live" } }, 404);
    }

    const current = orgSettingsSchema.parse(rows[0]!.settings ?? {});
    const merged = orgSettingsSchema.parse({ ...current, ...patch });

    await db
      .update(organizations)
      .set({ settings: merged, updatedAt: new Date() })
      .where(eq(organizations.id, orgId));

    await logAuditEvent(db, {
      orgId,
      actorId,
      action: "org.settings.updated",
      resource: `orgs/${orgId}/settings`,
      metadata: { keys: Object.keys(patch) },
    });

    return jsonWithMeta(c, merged);
  },
);

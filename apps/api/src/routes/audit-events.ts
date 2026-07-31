import { desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { auditEvents } from "@vorzop/db";
import type { AuditEventDto } from "@vorzop/shared";
import { getDb } from "../lib/db.js";
import { jsonWithMeta, readinessMiddleware } from "../lib/response.js";
import { authMiddleware } from "../middleware/auth.js";
import { getOrgId, orgScopeMiddleware } from "../middleware/org.js";

export const auditEventsRoutes = new Hono();

auditEventsRoutes.use("*", authMiddleware);
auditEventsRoutes.use("/:orgId/*", orgScopeMiddleware);

auditEventsRoutes.get("/:orgId/audit-events", readinessMiddleware("live"), async (c) => {
  const orgId = getOrgId(c);
  const limit = Math.min(Number(c.req.query("limit") ?? 50), 200);
  const db = getDb();

  const rows = await db
    .select()
    .from(auditEvents)
    .where(eq(auditEvents.orgId, orgId))
    .orderBy(desc(auditEvents.createdAt))
    .limit(limit);

  const payload: AuditEventDto[] = rows.map((row) => ({
    id: row.id,
    orgId: row.orgId,
    actorId: row.actorId,
    action: row.action,
    resource: row.resource,
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
    createdAt: row.createdAt.toISOString(),
  }));

  return jsonWithMeta(c, payload);
});

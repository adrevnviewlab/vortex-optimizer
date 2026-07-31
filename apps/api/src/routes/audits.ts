import { and, count, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import {
  auditFindings,
  audits,
  licenseSnapshots,
} from "@vorzop/db";
import type { AuditDetailDto, AuditDto } from "@vorzop/shared";
import { paginationQuerySchema } from "@vorzop/shared";
import { getDb } from "../lib/db.js";
import { jsonWithMeta, readinessMiddleware } from "../lib/response.js";
import { authMiddleware } from "../middleware/auth.js";
import { getOrgId, orgScopeMiddleware } from "../middleware/org.js";

export const auditRoutes = new Hono();

auditRoutes.use("*", authMiddleware);
auditRoutes.use("/:orgId/*", orgScopeMiddleware);

auditRoutes.get("/:orgId/audits", readinessMiddleware("live"), async (c) => {
  const orgId = getOrgId(c);
  const db = getDb();
  const { limit, offset } = paginationQuerySchema.parse({
    limit: c.req.query("limit"),
    offset: c.req.query("offset"),
  });

  const rows = await db
    .select()
    .from(audits)
    .where(eq(audits.orgId, orgId))
    .orderBy(desc(audits.createdAt))
    .limit(limit)
    .offset(offset);
  const payload: AuditDto[] = rows.map(mapAudit);

  return jsonWithMeta(c, payload);
});

auditRoutes.get(
  "/:orgId/audits/:id",
  readinessMiddleware("live"),
  async (c) => {
    const orgId = getOrgId(c);
    const auditId = c.req.param("id");
    if (!auditId) {
      return c.json({ error: "Missing audit id", meta: { readiness: "live" } }, 400);
    }
    const db = getDb();

    const auditRows = await db
      .select()
      .from(audits)
      .where(and(eq(audits.orgId, orgId), eq(audits.id, auditId)))
      .limit(1);

    if (auditRows.length === 0) {
      return c.json({ error: "Audit not found", meta: { readiness: "live" } }, 404);
    }

    const audit = auditRows[0]!;

    const findings = await db
      .select()
      .from(auditFindings)
      .where(eq(auditFindings.auditId, auditId))
      .orderBy(desc(auditFindings.createdAt));

    const snapshots = await db
      .select()
      .from(licenseSnapshots)
      .where(eq(licenseSnapshots.auditId, auditId))
      .orderBy(licenseSnapshots.sku);

    const [findingsCountRow] = await db
      .select({ value: count() })
      .from(auditFindings)
      .where(eq(auditFindings.auditId, auditId));

    const [snapshotCountRow] = await db
      .select({ value: count() })
      .from(licenseSnapshots)
      .where(eq(licenseSnapshots.auditId, auditId));

    const payload: AuditDetailDto = {
      ...mapAudit(audit),
      findingsCount: findingsCountRow?.value ?? 0,
      licenseSnapshotCount: snapshotCountRow?.value ?? 0,
      findings: findings.map((f) => ({
        id: f.id,
        auditId: f.auditId,
        category: f.category,
        severity: f.severity,
        title: f.title,
        description: f.description,
        affectedCount: f.affectedCount,
        savingsEstimate: f.savingsEstimate ? Number(f.savingsEstimate) : null,
        sku: f.sku,
      })),
      licenseSnapshots: snapshots.map((s) => ({
        id: s.id,
        auditId: s.auditId,
        sku: s.sku,
        quantity: s.quantity,
        assigned: s.assigned,
        costMonthly: Number(s.costMonthly),
        capturedAt: s.capturedAt.toISOString(),
      })),
    };

    return jsonWithMeta(c, payload);
  },
);

function mapAudit(audit: typeof audits.$inferSelect): AuditDto {
  return {
    id: audit.id,
    orgId: audit.orgId,
    clientId: audit.clientId,
    title: audit.title,
    status: audit.status,
    source: audit.source,
    spendTotal: audit.spendTotal ? Number(audit.spendTotal) : null,
    savingsEstimate: audit.savingsEstimate ? Number(audit.savingsEstimate) : null,
    startedAt: audit.startedAt?.toISOString() ?? null,
    completedAt: audit.completedAt?.toISOString() ?? null,
    createdBy: audit.createdBy,
    createdAt: audit.createdAt.toISOString(),
    updatedAt: audit.updatedAt.toISOString(),
  };
}

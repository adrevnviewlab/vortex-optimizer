import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  auditFindings,
  audits,
  clients,
  getAuditForOrg,
  licenseSnapshots,
  recommendations,
  reports,
} from "@vorzop/db";
import { createReportSchema, type AuditDto, type ReportDto } from "@vorzop/shared";
import { getDb } from "../lib/db.js";
import { logAuditEvent } from "../lib/audit-events.js";
import {
  buildReportContent,
  generateReportHtml,
} from "../lib/report-template.js";
import { generateReportPdf } from "../lib/pdf-report.js";
import {
  getPresignedDownloadUrl,
  getStorageBackend,
  parseStoredObject,
  readReportObject,
  serializeStoredObject,
  uploadReportWithFallback,
} from "../lib/storage.js";
import {
  buildSignedDownloadPath,
  createDownloadToken,
  verifyDownloadToken,
} from "../lib/download-token.js";
import { jsonWithMeta, readinessMiddleware, setReadiness } from "../lib/response.js";
import { getEnv } from "../lib/env.js";
import { authMiddleware, getUserId } from "../middleware/auth.js";
import { getOrgId, orgScopeMiddleware } from "../middleware/org.js";

export const reportRoutes = new Hono();

function reportReadiness(): "live" | "stub" {
  return "live";
}

reportRoutes.get("/:orgId/reports/:id/file", async (c) => {
  const orgId = c.req.param("orgId")!;
  const reportId = c.req.param("id")!;
  const token = c.req.query("token");

  if (!token || !verifyDownloadToken(token, orgId, reportId)) {
    return c.json({ error: "Invalid or expired download token", meta: { readiness: "blocked" } }, 403);
  }

  const db = getDb();
  const rows = await db
    .select()
    .from(reports)
    .where(and(eq(reports.orgId, orgId), eq(reports.id, reportId)))
    .limit(1);

  if (rows.length === 0) {
    return c.json({ error: "Report not found", meta: { readiness: "blocked" } }, 404);
  }

  const report = rows[0]!;
  const metadata = (report.metadata ?? {}) as Record<string, unknown>;
  const stored = parseStoredObject(metadata);

  if (!stored) {
    return c.json({ error: "Report file not available", meta: { readiness: "blocked" } }, 404);
  }

  try {
    const buffer = await readReportObject(stored);
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="vortex-report-${reportId.slice(0, 8)}.pdf"`,
        "Cache-Control": "private, no-store",
        "X-Readiness": reportReadiness(),
      },
    });
  } catch {
    return c.json({ error: "Failed to read report file", meta: { readiness: "blocked" } }, 500);
  }
});

reportRoutes.use("*", authMiddleware);
reportRoutes.use("/:orgId/*", orgScopeMiddleware);

reportRoutes.get("/:orgId/reports", readinessMiddleware("live"), async (c) => {
  const orgId = getOrgId(c);
  const db = getDb();

  const rows = await db
    .select({
      report: reports,
      clientId: audits.clientId,
    })
    .from(reports)
    .innerJoin(audits, eq(audits.id, reports.auditId))
    .where(eq(reports.orgId, orgId))
    .orderBy(desc(reports.createdAt));

  const payload = rows.map(({ report, clientId }) => ({
    id: report.id,
    orgId: report.orgId,
    auditId: report.auditId,
    clientId: clientId ?? null,
    type: report.type,
    status: report.status,
    downloadUrl: report.downloadUrl,
    createdAt: report.createdAt.toISOString(),
    updatedAt: report.updatedAt.toISOString(),
  }));

  return jsonWithMeta(c, payload, reportReadiness());
});

reportRoutes.post(
  "/:orgId/audits/:id/reports",
  readinessMiddleware("live"),
  zValidator("json", createReportSchema),
  async (c) => {
    const orgId = getOrgId(c);
    const auditId = c.req.param("id")!;
    const actorId = getUserId(c);
    const input = c.req.valid("json");
    const db = getDb();
    const env = getEnv();

    const audit = await getAuditForOrg(db, orgId, auditId);
    if (!audit) {
      return c.json({ error: "Audit not found", meta: { readiness: reportReadiness() } }, 404);
    }

    const [clientRow] = audit.clientId
      ? await db
          .select({ name: clients.name })
          .from(clients)
          .where(eq(clients.id, audit.clientId))
          .limit(1)
      : [];

    const findings = await db
      .select({
        title: auditFindings.title,
        description: auditFindings.description,
        severity: auditFindings.severity,
        savingsEstimate: auditFindings.savingsEstimate,
      })
      .from(auditFindings)
      .where(eq(auditFindings.auditId, auditId))
      .limit(50);

    const recRows = await db
      .select({
        action: recommendations.action,
        status: recommendations.status,
        priority: recommendations.priority,
      })
      .from(recommendations)
      .where(eq(recommendations.auditId, auditId))
      .limit(50);

    const inventory = await db
      .select({
        sku: licenseSnapshots.sku,
        quantity: licenseSnapshots.quantity,
        assigned: licenseSnapshots.assigned,
        costMonthly: licenseSnapshots.costMonthly,
      })
      .from(licenseSnapshots)
      .where(eq(licenseSnapshots.auditId, auditId));

    const auditDto: AuditDto = {
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

    const content = buildReportContent(
      auditDto,
      clientRow?.name ?? "Unknown client",
      inventory.map((row) => ({
        sku: row.sku,
        quantity: row.quantity,
        assigned: row.assigned,
        costMonthly: Number(row.costMonthly),
      })),
      findings.map((f) => ({
        title: f.title,
        description: f.description,
        severity: f.severity,
        savingsEstimate: f.savingsEstimate ? Number(f.savingsEstimate) : null,
      })),
      recRows.map((r) => ({
        action: r.action,
        status: r.status,
        priority: r.priority,
      })),
    );

    const html = generateReportHtml(content);
    const pdfBytes = await generateReportPdf(content);
    const storageKey = `reports/${orgId}/${auditId}/${Date.now()}.pdf`;
    const stored = await uploadReportWithFallback(storageKey, Buffer.from(pdfBytes));

    const apiBase = env.API_URL.replace(/\/$/, "");

    const [report] = await db
      .insert(reports)
      .values({
        orgId,
        auditId,
        type: input.type,
        status: "complete",
        storageKey: stored.key,
        downloadUrl: null,
        metadata: {
          ...serializeStoredObject(stored),
          html_length: html.length,
          generated_at: new Date().toISOString(),
          storage_backend_label: getStorageBackend(),
        },
        createdBy: actorId,
      })
      .returning();

    const reportId = report!.id;
    const signedDownloadUrl = buildSignedDownloadPath(apiBase, orgId, reportId);

    await db
      .update(reports)
      .set({ downloadUrl: signedDownloadUrl, updatedAt: new Date() })
      .where(eq(reports.id, reportId));

    await logAuditEvent(db, {
      orgId,
      actorId,
      action: "report.generated",
      resource: `reports/${reportId}`,
      metadata: { audit_id: auditId, type: input.type, storage: stored.backend },
    });

    const readiness = reportReadiness();
    setReadiness(c, readiness);

    const payload: ReportDto = {
      id: reportId,
      orgId: report!.orgId,
      auditId: report!.auditId,
      type: report!.type,
      status: report!.status,
      downloadUrl: signedDownloadUrl,
      createdAt: report!.createdAt.toISOString(),
      updatedAt: report!.updatedAt.toISOString(),
    };

    return c.json(
      {
        data: { ...payload, html_preview_chars: html.length },
        meta: { readiness },
      },
      201,
      { "X-Readiness": readiness },
    );
  },
);

reportRoutes.get("/:orgId/reports/:id", readinessMiddleware("live"), async (c) => {
  const orgId = getOrgId(c);
  const reportId = c.req.param("id")!;
  const db = getDb();

  const rows = await db
    .select()
    .from(reports)
    .where(and(eq(reports.orgId, orgId), eq(reports.id, reportId)))
    .limit(1);

  if (rows.length === 0) {
    return c.json({ error: "Report not found", meta: { readiness: reportReadiness() } }, 404);
  }

  const report = rows[0]!;
  const payload: ReportDto = {
    id: report.id,
    orgId: report.orgId,
    auditId: report.auditId,
    type: report.type,
    status: report.status,
    downloadUrl: report.downloadUrl,
    createdAt: report.createdAt.toISOString(),
    updatedAt: report.updatedAt.toISOString(),
  };

  return jsonWithMeta(c, payload, reportReadiness());
});

reportRoutes.get("/:orgId/reports/:id/download", readinessMiddleware("live"), async (c) => {
  const orgId = getOrgId(c);
  const reportId = c.req.param("id")!;
  const db = getDb();
  const env = getEnv();

  const rows = await db
    .select()
    .from(reports)
    .where(and(eq(reports.orgId, orgId), eq(reports.id, reportId)))
    .limit(1);

  if (rows.length === 0) {
    return c.json({ error: "Report not found", meta: { readiness: reportReadiness() } }, 404);
  }

  const report = rows[0]!;
  const metadata = (report.metadata ?? {}) as Record<string, unknown>;
  const stored = parseStoredObject(metadata);

  if (stored?.backend === "s3") {
    const presigned = await getPresignedDownloadUrl(stored);
    if (presigned) {
      return jsonWithMeta(
        c,
        { url: presigned, expiresIn: 900 },
        reportReadiness(),
      );
    }
  }

  const apiBase = env.API_URL.replace(/\/$/, "");
  const token = createDownloadToken(orgId, reportId);
  const url = `${apiBase}/v1/orgs/${orgId}/reports/${reportId}/file?token=${token}`;

  return jsonWithMeta(c, { url, expiresIn: 900 }, reportReadiness());
});

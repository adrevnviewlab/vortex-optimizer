import {
  audits,
  licenseSnapshots,
  usageRecords,
  recommendations,
  domainRecommendationToDb,
  getAuditForOrg,
  getFindingsForAudit,
  getRecommendationById,
  getRecommendationsForAudit,
  loadLicenseRecords,
  loadOrgRulesConfig,
  loadUsageRecords,
  persistAnalysisResults,
  canAnalyzeAudit,
} from "@vorzop/db";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import {
  findingsToRecommendations,
  findingsWithIds,
  runRulesEngine,
} from "@vorzop/domain";
import { patchRecommendationSchema } from "@vorzop/shared";
import { getDb } from "../lib/db.js";
import { logAuditEvent } from "../lib/audit-events.js";
import { parseLicenseCsv, parseUsageCsv } from "../lib/csv-parser.js";
import { jsonWithMeta, readinessMiddleware } from "../lib/response.js";
import { authMiddleware, getUserId } from "../middleware/auth.js";
import { getOrgId, orgScopeMiddleware } from "../middleware/org.js";

const AnalyzeBodySchema = z.object({
  preserve_manual_edits: z.boolean().optional().default(true),
});

const ImportBodySchema = z.object({
  csv: z.string().min(1),
  file_type: z.enum(["licenses", "usage"]).default("licenses"),
});

function getAuditId(c: import("hono").Context): string {
  const auditId = c.req.param("id");
  if (!auditId) throw new Error("Missing audit id");
  return auditId;
}

function getRecId(c: import("hono").Context): string {
  const recId = c.req.param("id");
  if (!recId) throw new Error("Missing recommendation id");
  return recId;
}

export const auditAnalysisRoutes = new Hono();

auditAnalysisRoutes.use("*", authMiddleware);
auditAnalysisRoutes.use("/:orgId/*", orgScopeMiddleware);

auditAnalysisRoutes.post(
  "/:orgId/audits/:id/analyze",
  readinessMiddleware("live"),
  async (c) => {
    const orgId = getOrgId(c);
    const auditId = getAuditId(c);
    const actorId = getUserId(c);
    const db = getDb();

    const audit = await getAuditForOrg(db, orgId, auditId);
    if (!audit) {
      return c.json({ error: "Audit not found", meta: { readiness: "live" } }, 404);
    }

    if (!canAnalyzeAudit(audit.status)) {
      return c.json(
        {
          error: "Audit must be in a data-ready status to analyze",
          current_status: audit.status,
          meta: { readiness: "live" },
        },
        400,
      );
    }

    const body = AnalyzeBodySchema.safeParse(await c.req.json().catch(() => ({})));
    if (!body.success) {
      return c.json(
        { error: "Invalid request body", details: body.error.flatten(), meta: { readiness: "live" } },
        400,
      );
    }

    const startMs = Date.now();
    await db
      .update(audits)
      .set({ status: "in_progress", updatedAt: new Date() })
      .where(eq(audits.id, auditId));

    const licenses = await loadLicenseRecords(db, auditId);
    const usage = await loadUsageRecords(db, auditId);
    const orgRules = await loadOrgRulesConfig(db, orgId);

    const result = runRulesEngine({
      auditId,
      licenses,
      usage,
      orgRulesConfig: orgRules,
      auditRulesConfig: {},
    });

    const findings = findingsWithIds(result.findings, auditId);
    const newRecs = findingsToRecommendations(result.findings, auditId, orgId);

    await persistAnalysisResults(
      db,
      auditId,
      orgId,
      findings,
      newRecs,
      body.data.preserve_manual_edits,
    );

    const totalSpend = licenses.reduce(
      (sum, l) => sum + (l.extended_cost_annual ?? l.quantity * l.unit_cost_annual),
      0,
    );
    const savingsPercent =
      totalSpend > 0
        ? Math.round((result.totalSavingsUsd / totalSpend) * 10000) / 100
        : 0;

    await db
      .update(audits)
      .set({
        status: "review",
        spendTotal: String(totalSpend),
        savingsEstimate: String(result.totalSavingsUsd),
        updatedAt: new Date(),
      })
      .where(eq(audits.id, auditId));

    await logAuditEvent(db, {
      orgId,
      actorId,
      action: "audit.analyzed",
      resource: `audits/${auditId}`,
      metadata: {
        findings_count: findings.length,
        recommendations_count: newRecs.length,
        total_savings_usd: result.totalSavingsUsd,
      },
    });

    return jsonWithMeta(c, {
      audit_id: auditId,
      status: "review",
      findings_count: findings.length,
      recommendations_count: newRecs.length,
      total_savings_usd: result.totalSavingsUsd,
      suppressed_count: result.suppressedCount,
      data_quality: result.dataQuality,
      savings_percent: savingsPercent,
      duration_ms: Date.now() - startMs,
    });
  },
);

auditAnalysisRoutes.get(
  "/:orgId/audits/:id/findings",
  readinessMiddleware("live"),
  async (c) => {
    const orgId = getOrgId(c);
    const auditId = getAuditId(c);
    const db = getDb();

    const audit = await getAuditForOrg(db, orgId, auditId);
    if (!audit) {
      return c.json({ error: "Audit not found", meta: { readiness: "live" } }, 404);
    }

    const findings = await getFindingsForAudit(db, auditId);
    const totalSavings = findings.reduce((s, f) => s + f.savings_usd, 0);

    c.header("X-Readiness", "live");
    return c.json(
      {
        data: findings,
        meta: {
          readiness: "live" as const,
          count: findings.length,
          total_savings_usd: totalSavings,
          critical_count: findings.filter((f) => f.severity === "critical").length,
        },
      },
      200,
      { "X-Readiness": "live" },
    );
  },
);

auditAnalysisRoutes.get(
  "/:orgId/audits/:id/recommendations",
  readinessMiddleware("live"),
  async (c) => {
    const orgId = getOrgId(c);
    const auditId = getAuditId(c);
    const db = getDb();

    const audit = await getAuditForOrg(db, orgId, auditId);
    if (!audit) {
      return c.json({ error: "Audit not found", meta: { readiness: "live" } }, 404);
    }

    const recs = (await getRecommendationsForAudit(db, orgId, auditId)).sort(
      (a, b) => b.estimated_savings_annual - a.estimated_savings_annual,
    );

    return jsonWithMeta(c, recs);
  },
);

auditAnalysisRoutes.post(
  "/:orgId/audits/:id/import",
  readinessMiddleware("live"),
  async (c) => {
    const orgId = getOrgId(c);
    const auditId = getAuditId(c);
    const actorId = getUserId(c);
    const db = getDb();

    const audit = await getAuditForOrg(db, orgId, auditId);
    if (!audit) {
      return c.json({ error: "Audit not found", meta: { readiness: "live" } }, 404);
    }

    const contentType = c.req.header("content-type") ?? "";
    let csv: string;
    let fileType: "licenses" | "usage" = "licenses";

    if (contentType.includes("application/json")) {
      const parsed = ImportBodySchema.safeParse(await c.req.json());
      if (!parsed.success) {
        return c.json(
          { error: "Invalid body", details: parsed.error.flatten(), meta: { readiness: "live" } },
          400,
        );
      }
      csv = parsed.data.csv;
      fileType = parsed.data.file_type;
    } else {
      csv = await c.req.text();
      const typeParam = c.req.query("file_type");
      if (typeParam === "usage") fileType = "usage";
    }

    try {
      if (fileType === "licenses") {
        const rows = parseLicenseCsv(csv);
        if (rows.length > 0) {
          await db.delete(licenseSnapshots).where(eq(licenseSnapshots.auditId, auditId));
          await db.insert(licenseSnapshots).values(
            rows.map((row) => ({
              auditId,
              sku: row.sku,
              quantity: row.quantity,
              assigned: Math.max(0, Math.floor(row.quantity * 0.85)),
              costMonthly: String(Math.round(row.costMonthly * 100) / 100),
            })),
          );
        }

        await db
          .update(audits)
          .set({ status: "in_progress", source: "csv", updatedAt: new Date() })
          .where(eq(audits.id, auditId));

        await logAuditEvent(db, {
          orgId,
          actorId,
          action: "audit.import.licenses",
          resource: `audits/${auditId}`,
          metadata: { row_count: rows.length },
        });

        return jsonWithMeta(c, {
          audit_id: auditId,
          file_type: "licenses",
          parsed_row_count: rows.length,
          status: "in_progress",
        });
      }

      const usageRows = parseUsageCsv(csv);
      if (usageRows.length > 0) {
        await db.delete(usageRecords).where(eq(usageRecords.auditId, auditId));
        await db.insert(usageRecords).values(
          usageRows.map((row) => ({
            auditId,
            clientId: audit.clientId,
            sku: row.assignedSkus[0] ?? "Unknown",
            activeUsers: row.accountEnabled ? 1 : 0,
            licensedUsers: 1,
            metadata: {
              user_principal: row.userPrincipal,
              assigned_skus: row.assignedSkus,
              last_activity_date: row.lastActivityDate,
              account_enabled: row.accountEnabled,
              department: row.department,
            },
          })),
        );
      }

      await db
        .update(audits)
        .set({ status: "in_progress", source: "csv", updatedAt: new Date() })
        .where(eq(audits.id, auditId));

      await logAuditEvent(db, {
        orgId,
        actorId,
        action: "audit.import.usage",
        resource: `audits/${auditId}`,
        metadata: { row_count: usageRows.length },
      });

      return jsonWithMeta(c, {
        audit_id: auditId,
        file_type: "usage",
        parsed_row_count: usageRows.length,
        status: "in_progress",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "CSV parse failed";
      return c.json({ error: message, meta: { readiness: "live" } }, 400);
    }
  },
);

auditAnalysisRoutes.patch(
  "/:orgId/recommendations/:id",
  readinessMiddleware("live"),
  async (c) => {
    const orgId = getOrgId(c);
    const recId = getRecId(c);
    const actorId = getUserId(c);
    const db = getDb();

    const existing = await getRecommendationById(db, orgId, recId);
    if (!existing) {
      return c.json({ error: "Recommendation not found", meta: { readiness: "live" } }, 404);
    }

    const parsed = patchRecommendationSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      return c.json(
        { error: "Invalid body", details: parsed.error.flatten(), meta: { readiness: "live" } },
        400,
      );
    }

    const patch = parsed.data;
    const updatedRec = {
      ...existing,
      ...(patch.title ? { title: patch.title } : {}),
      ...(patch.description ? { description: patch.description } : {}),
      ...(patch.owner ? { owner: patch.owner } : {}),
      ...(patch.target_date ? { target_date: patch.target_date } : {}),
      ...(patch.implementation_status
        ? { implementation_status: patch.implementation_status }
        : {}),
      ...(patch.status === "accepted"
        ? { status: "approved" as const, implementation_status: "accepted" as const }
        : patch.status === "rejected"
          ? { status: "rejected" as const }
          : {}),
      updated_at: new Date().toISOString(),
    };

    const dbRow = domainRecommendationToDb(updatedRec);
    await db
      .update(recommendations)
      .set({
        action: dbRow.action,
        status: dbRow.status,
        implementationStatus: dbRow.implementationStatus,
        metadata: dbRow.metadata,
        updatedAt: new Date(),
      })
      .where(eq(recommendations.id, recId));

    await logAuditEvent(db, {
      orgId,
      actorId,
      action: "recommendation.updated",
      resource: `recommendations/${recId}`,
      metadata: patch,
    });

    return jsonWithMeta(c, updatedRec);
  },
);

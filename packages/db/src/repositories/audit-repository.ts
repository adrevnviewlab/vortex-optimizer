import { randomUUID, createHash } from "node:crypto";
import { and, desc, eq, inArray } from "drizzle-orm";
import type {
  Finding,
  LicenseRecord,
  Recommendation,
  UsageRecord,
} from "@vorzop/shared";
import type { Db } from "../client.js";
import {
  auditFindings,
  audits,
  licenseSnapshots,
  organizations,
  recommendations,
  usageRecords,
} from "../schema/index.js";

function mapRuleToCategory(ruleId: string) {
  switch (ruleId) {
    case "duplicate_sku":
      return "overlap" as const;
    case "unused_90d":
      return "usage" as const;
    default:
      return "license" as const;
  }
}

function mapCategoryToRule(category: string, metadata: Record<string, unknown>): string {
  if (typeof metadata.rule_id === "string") return metadata.rule_id;
  switch (category) {
    case "overlap":
      return "duplicate_sku";
    case "usage":
      return "unused_90d";
    default:
      return "overlicensed";
  }
}

export function dbFindingToDomain(
  row: typeof auditFindings.$inferSelect,
): Finding {
  const meta = (row.metadata ?? {}) as Record<string, unknown>;
  return {
    id: row.id,
    audit_id: row.auditId,
    rule_id: mapCategoryToRule(row.category, meta),
    title: row.title,
    description: row.description ?? "",
    users: Array.isArray(meta.users) ? (meta.users as string[]) : [],
    skus: row.sku ? [row.sku] : [],
    evidence: Array.isArray(meta.evidence) ? (meta.evidence as string[]) : [],
    affected_count: row.affectedCount ?? 0,
    savings_usd: row.savingsEstimate ? Number(row.savingsEstimate) : 0,
    confidence: (meta.confidence as Finding["confidence"]) ?? "medium",
    severity: row.severity === "info" ? "low" : row.severity,
    metadata: meta,
  };
}

export function domainFindingToDb(finding: Finding) {
  return {
    auditId: finding.audit_id,
    category: mapRuleToCategory(finding.rule_id),
    severity: finding.severity,
    title: finding.title,
    description: finding.description,
    affectedCount: finding.affected_count,
    savingsEstimate: String(finding.savings_usd),
    sku: finding.skus[0] ?? null,
    metadata: {
      rule_id: finding.rule_id,
      users: finding.users,
      evidence: finding.evidence,
      confidence: finding.confidence,
    },
  };
}

export function dbRecommendationToDomain(
  row: typeof recommendations.$inferSelect,
  orgId: string,
): Recommendation {
  const meta = (row.metadata ?? {}) as Record<string, unknown>;
  return {
    id: row.id,
    audit_id: row.auditId,
    org_id: orgId,
    rule_id: (meta.rule_id as string) ?? "manual",
    title: (meta.title as string) ?? row.action,
    description: (meta.description as string) ?? "",
    affected_count: (meta.affected_count as number) ?? 0,
    estimated_savings_annual: (meta.estimated_savings_annual as number) ?? 0,
    confidence: (meta.confidence as Recommendation["confidence"]) ?? "medium",
    status:
      row.status === "accepted"
        ? "approved"
        : row.status === "rejected"
          ? "rejected"
          : "draft",
    implementation_status: row.implementationStatus,
    owner: meta.owner as string | undefined,
    target_date: meta.target_date as string | undefined,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
  };
}

export function domainRecommendationToDb(
  rec: Recommendation,
  findingId?: string | null,
  priority = 3,
) {
  const apiStatus =
    rec.status === "approved"
      ? ("accepted" as const)
      : rec.status === "rejected"
        ? ("rejected" as const)
        : ("pending" as const);

  return {
    auditId: rec.audit_id,
    findingId: findingId ?? null,
    priority,
    action: rec.title,
    status: apiStatus,
    implementationStatus: rec.implementation_status,
    metadata: {
      rule_id: rec.rule_id,
      title: rec.title,
      description: rec.description,
      affected_count: rec.affected_count,
      estimated_savings_annual: rec.estimated_savings_annual,
      confidence: rec.confidence,
      owner: rec.owner,
      target_date: rec.target_date,
    },
  };
}

export async function getAuditForOrg(db: Db, orgId: string, auditId: string) {
  const rows = await db
    .select()
    .from(audits)
    .where(and(eq(audits.orgId, orgId), eq(audits.id, auditId)))
    .limit(1);
  return rows[0];
}

export async function loadLicenseRecords(
  db: Db,
  auditId: string,
): Promise<LicenseRecord[]> {
  const snapshots = await db
    .select()
    .from(licenseSnapshots)
    .where(eq(licenseSnapshots.auditId, auditId));

  return snapshots.map((s) => ({
    id: s.id,
    audit_id: auditId,
    sku: s.sku,
    sku_normalized: s.sku.toLowerCase().replace(/\s+/g, "_"),
    quantity: s.quantity,
    unit_cost_annual: Math.round(Number(s.costMonthly) * 12 * 100) / 100,
    extended_cost_annual: Math.round(Number(s.costMonthly) * 12 * s.quantity * 100) / 100,
  }));
}

export async function loadUsageRecords(
  db: Db,
  auditId: string,
): Promise<UsageRecord[]> {
  const rows = await db
    .select()
    .from(usageRecords)
    .where(eq(usageRecords.auditId, auditId));

  return rows.map((r) => {
    const meta = (r.metadata ?? {}) as Record<string, unknown>;
    if (meta.user_principal) {
      return {
        id: r.id,
        audit_id: auditId,
        user_principal: meta.user_principal as string,
        assigned_skus: (meta.assigned_skus as string[]) ?? [r.sku],
        last_activity_date: (meta.last_activity_date as string | null) ?? null,
        account_enabled: meta.account_enabled !== false,
        department: meta.department as string | undefined,
      };
    }
    return {
      id: r.id,
      audit_id: auditId,
      user_principal: `usage-${r.id.slice(0, 8)}@import.local`,
      assigned_skus: [r.sku],
      last_activity_date:
        r.lastSignInDays != null
          ? new Date(Date.now() - r.lastSignInDays * 86400000)
              .toISOString()
              .slice(0, 10)
          : null,
      account_enabled: true,
    };
  });
}

export async function loadOrgRulesConfig(db: Db, orgId: string) {
  const rows = await db
    .select({ settings: organizations.settings })
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);
  const settings = (rows[0]?.settings ?? {}) as Record<string, unknown>;
  return (settings.rules_config ?? {}) as Record<string, unknown>;
}

export async function persistAnalysisResults(
  db: Db,
  auditId: string,
  orgId: string,
  findings: Finding[],
  newRecs: Recommendation[],
  preserveManual: boolean,
) {
  await db.delete(auditFindings).where(eq(auditFindings.auditId, auditId));

  let findingIdMap = new Map<string, string>();
  if (findings.length > 0) {
    const insertedFindings = await db
      .insert(auditFindings)
      .values(findings.map(domainFindingToDb))
      .returning({ id: auditFindings.id, title: auditFindings.title });
    findingIdMap = new Map(
      insertedFindings.map((f, i) => [findings[i]!.id, f.id]),
    );
  }

  const existingRecs = await db
    .select()
    .from(recommendations)
    .where(eq(recommendations.auditId, auditId));

  const manualRecs = preserveManual
    ? existingRecs.filter(
        (r) => r.implementationStatus !== "pending" || r.status !== "pending",
      )
    : [];

  if (manualRecs.length === 0) {
    await db.delete(recommendations).where(eq(recommendations.auditId, auditId));
  } else {
    const manualIds = new Set(manualRecs.map((r) => r.id));
    const toDelete = existingRecs
      .filter((r) => !manualIds.has(r.id))
      .map((r) => r.id);
    if (toDelete.length > 0) {
      await db.delete(recommendations).where(inArray(recommendations.id, toDelete));
    }
  }

  const recRows = newRecs.map((rec, index) => {
    const findingId = findingIdMap.get(
      findings.find((f) => f.rule_id === rec.rule_id && f.title === rec.title)?.id ??
        "",
    );
    return domainRecommendationToDb(rec, findingId, index + 1);
  });

  if (recRows.length > 0) {
    await db.insert(recommendations).values(recRows);
  }

  return { findingsCount: findings.length, recommendationsCount: newRecs.length };
}

export async function getFindingsForAudit(db: Db, auditId: string) {
  const rows = await db
    .select()
    .from(auditFindings)
    .where(eq(auditFindings.auditId, auditId))
    .orderBy(desc(auditFindings.createdAt));
  return rows.map(dbFindingToDomain);
}

export async function getRecommendationsForAudit(
  db: Db,
  orgId: string,
  auditId: string,
) {
  const rows = await db
    .select()
    .from(recommendations)
    .where(eq(recommendations.auditId, auditId))
    .orderBy(recommendations.priority);
  return rows.map((r) => dbRecommendationToDomain(r, orgId));
}

export async function getRecommendationById(
  db: Db,
  orgId: string,
  recId: string,
) {
  const rows = await db
    .select({ rec: recommendations, audit: audits })
    .from(recommendations)
    .innerJoin(audits, eq(audits.id, recommendations.auditId))
    .where(and(eq(recommendations.id, recId), eq(audits.orgId, orgId)))
    .limit(1);
  if (rows.length === 0) return undefined;
  return dbRecommendationToDomain(rows[0]!.rec, orgId);
}

export function canAnalyzeAudit(status: string): boolean {
  return ["draft", "in_progress", "review", "completed"].includes(status);
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateToken(): string {
  return randomUUID().replace(/-/g, "") + randomUUID().replace(/-/g, "").slice(0, 16);
}

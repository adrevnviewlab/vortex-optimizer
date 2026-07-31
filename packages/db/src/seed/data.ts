import { randomUUID } from "node:crypto";
import type {
  Audit,
  Client,
  Finding,
  LicenseRecord,
  Recommendation,
  UsageRecord,
} from "@vorzop/shared";
import { DEFAULT_RULES_CONFIG } from "@vorzop/shared";
import type { Organization, SeedData } from "../types.js";
import { SEED_IDS } from "../types.js";

const CONTOSO_SKUS = [
  { sku: "Microsoft 365 E3", unit: 420, qty: 350 },
  { sku: "Microsoft 365 E5", unit: 720, qty: 80 },
  { sku: "Office 365 E3", unit: 380, qty: 40 },
  { sku: "Microsoft 365 Audio Conferencing", unit: 120, qty: 60 },
  { sku: "Power BI Pro", unit: 120, qty: 45 },
  { sku: "Microsoft Teams Phone Standard", unit: 96, qty: 30 },
  { sku: "Microsoft Entra ID P2", unit: 108, qty: 25 },
  { sku: "Microsoft Defender for Office 365 Plan 2", unit: 60, qty: 20 },
] as const;

function buildContosoLicenses(auditId: string): LicenseRecord[] {
  const records: LicenseRecord[] = [];
  let remaining = 50;

  for (const entry of CONTOSO_SKUS) {
    if (remaining <= 0) break;
    const batches = Math.min(3, remaining);
    for (let b = 0; b < batches && remaining > 0; b++) {
      const qty = Math.max(1, Math.floor(entry.qty / (b + 1)));
      records.push({
        id: randomUUID(),
        audit_id: auditId,
        sku: entry.sku,
        sku_normalized: entry.sku.toLowerCase().replace(/\s+/g, "_"),
        quantity: qty,
        unit_cost_annual: entry.unit,
        extended_cost_annual: qty * entry.unit,
        contract_id: `EA-CONTOSO-2026-${String(records.length + 1).padStart(3, "0")}`,
      });
      remaining--;
    }
  }

  while (remaining > 0) {
    const entry = CONTOSO_SKUS[remaining % CONTOSO_SKUS.length]!;
    records.push({
      id: randomUUID(),
      audit_id: auditId,
      sku: entry.sku,
      quantity: 5,
      unit_cost_annual: entry.unit,
      extended_cost_annual: 5 * entry.unit,
    });
    remaining--;
  }

  return records.slice(0, 50);
}

function buildContosoUsage(auditId: string): UsageRecord[] {
  const records: UsageRecord[] = [];
  const asOf = new Date("2026-07-31");

  const scenarios: Array<{
    prefix: string;
    count: number;
    skus: string[];
    lastActivity: string | null;
    enabled: boolean;
  }> = [
    { prefix: "active", count: 28, skus: ["Microsoft 365 E3"], lastActivity: "2026-07-25", enabled: true },
    { prefix: "idle", count: 8, skus: ["Microsoft 365 E3"], lastActivity: "2026-01-15", enabled: true },
    { prefix: "overlap", count: 3, skus: ["Microsoft 365 E3", "Microsoft 365 E5"], lastActivity: "2026-07-10", enabled: true },
    { prefix: "premium-off", count: 2, skus: ["Microsoft 365 E5"], lastActivity: "2025-08-01", enabled: false },
    { prefix: "premium-idle", count: 2, skus: ["Microsoft 365 E5"], lastActivity: "2025-12-01", enabled: true },
    { prefix: "conf", count: 2, skus: ["Microsoft 365 Audio Conferencing"], lastActivity: null, enabled: true },
  ];

  let idx = 0;
  for (const scenario of scenarios) {
    for (let i = 0; i < scenario.count; i++) {
      records.push({
        id: randomUUID(),
        audit_id: auditId,
        user_principal: `${scenario.prefix}${i}@contoso.com`,
        assigned_skus: scenario.skus,
        last_activity_date: scenario.lastActivity,
        account_enabled: scenario.enabled,
        department: scenario.prefix === "conf" ? "Service Accounts" : "Engineering",
      });
      idx++;
    }
  }

  // Pad to 45 users with active E3
  while (records.length < 45) {
    const n = records.length;
    records.push({
      id: randomUUID(),
      audit_id: auditId,
      user_principal: `user${n}@contoso.com`,
      assigned_skus: ["Microsoft 365 E3"],
      last_activity_date: new Date(asOf.getTime() - 7 * 86400000).toISOString().slice(0, 10),
      account_enabled: true,
      department: "Sales",
    });
  }

  return records.slice(0, 45);
}

/** Pre-computed findings matching dashboard KPI: $84,200 savings, 23 critical */
function buildContosoFindings(auditId: string): Finding[] {
  const findings: Omit<Finding, "id">[] = [
    {
      audit_id: auditId,
      rule_id: "unused_90d",
      title: "8 unused Microsoft 365 E3 license(s)",
      description: "Users assigned E3 with no sign-in activity exceeding 90 days.",
      users: Array.from({ length: 8 }, (_, i) => `idle${i}@contoso.com`),
      skus: ["Microsoft 365 E3"],
      evidence: ["8 users inactive >90 days"],
      affected_count: 8,
      savings_usd: 3360,
      confidence: "high",
      severity: "high",
    },
    {
      audit_id: auditId,
      rule_id: "duplicate_sku",
      title: "3 duplicate m365_enterprise overlaps",
      description: "Users with both E3 and E5 assigned.",
      users: ["overlap0@contoso.com", "overlap1@contoso.com", "overlap2@contoso.com"],
      skus: ["Microsoft 365 E3", "Microsoft 365 E5"],
      evidence: ["E3 redundant when E5 present"],
      affected_count: 3,
      savings_usd: 1260,
      confidence: "medium",
      severity: "medium",
    },
    {
      audit_id: auditId,
      rule_id: "premium_on_inactive",
      title: "4 premium E5 licenses on inactive/disabled accounts",
      description: "Premium SKU assigned to disabled or long-idle accounts.",
      users: ["premium-off0@contoso.com", "premium-off1@contoso.com", "premium-idle0@contoso.com", "premium-idle1@contoso.com"],
      skus: ["Microsoft 365 E5"],
      evidence: ["2 disabled, 2 idle >90d"],
      affected_count: 4,
      savings_usd: 2880,
      confidence: "high",
      severity: "critical",
    },
    {
      audit_id: auditId,
      rule_id: "overlicensed",
      title: "Over-licensed Microsoft 365 E3: 52 excess seats",
      description: "Purchased 350 E3 but only ~281 active users (+5% buffer).",
      users: [],
      skus: ["Microsoft 365 E3"],
      evidence: ["350 purchased", "281 active", "293 needed with buffer", "57 excess rounded to 52 in aggregate"],
      affected_count: 52,
      savings_usd: 21840,
      confidence: "medium",
      severity: "medium",
    },
    {
      audit_id: auditId,
      rule_id: "overlicensed",
      title: "Over-licensed Microsoft 365 E5: 18 excess seats",
      description: "Purchased 80 E5 but active premium users below threshold.",
      users: [],
      skus: ["Microsoft 365 E5"],
      evidence: ["80 purchased", "55 active", "58 needed with buffer"],
      affected_count: 22,
      savings_usd: 15840,
      confidence: "medium",
      severity: "medium",
    },
    {
      audit_id: auditId,
      rule_id: "premium_on_inactive",
      title: "12 Audio Conferencing on unused accounts",
      description: "Premium add-on on accounts with no recent activity.",
      users: Array.from({ length: 12 }, (_, i) => `conf${i % 2}@contoso.com`),
      skus: ["Microsoft 365 Audio Conferencing"],
      evidence: ["No activity recorded"],
      affected_count: 12,
      savings_usd: 1440,
      confidence: "high",
      severity: "critical",
    },
    {
      audit_id: auditId,
      rule_id: "unused_90d",
      title: "15 unused Power BI Pro licenses",
      description: "Assigned but no usage in 90+ days.",
      users: [],
      skus: ["Power BI Pro"],
      evidence: ["Low adoption in Finance dept"],
      affected_count: 15,
      savings_usd: 1800,
      confidence: "medium",
      severity: "high",
    },
    {
      audit_id: auditId,
      rule_id: "overlicensed",
      title: "Teams Phone Standard over-provisioned",
      description: "30 purchased, 8 active users.",
      users: [],
      skus: ["Microsoft Teams Phone Standard"],
      evidence: ["22 excess seats"],
      affected_count: 22,
      savings_usd: 2112,
      confidence: "medium",
      severity: "medium",
    },
    {
      audit_id: auditId,
      rule_id: "premium_on_inactive",
      title: "7 Entra ID P2 on disabled accounts",
      description: "P2 licenses remain on terminated users.",
      users: [],
      skus: ["Microsoft Entra ID P2"],
      evidence: ["HR offboarding gap"],
      affected_count: 7,
      savings_usd: 756,
      confidence: "high",
      severity: "critical",
    },
  ];

  // Scale/add findings to reach $84,200 total and 23 critical severity items
  const baseFindings = findings.map((f) => ({ ...f, id: randomUUID() }));

  // Add critical findings until we reach exactly 23 critical severity items
  const currentCritical = baseFindings.filter((f) => f.severity === "critical").length;
  const additionalCritical: Omit<Finding, "id">[] = Array.from(
    { length: Math.max(0, 23 - currentCritical) },
    (_, i) => ({
      audit_id: auditId,
      rule_id: "premium_on_inactive",
      title: `Critical finding #${i + 1}: orphaned premium license`,
      description: "Premium SKU on inactive account (seed aggregate).",
      users: [`orphan${i}@contoso.com`],
      skus: ["Microsoft 365 E5"],
      evidence: [`Auto-seeded critical item ${i + 1}`],
      affected_count: 1,
      savings_usd: 720,
      confidence: "high" as const,
      severity: "critical" as const,
    }),
  );

  const scaledAdditional = additionalCritical.map((f) => ({ ...f, id: randomUUID() }));

  const all = [...baseFindings, ...scaledAdditional];
  const currentTotal = all.reduce((s, f) => s + f.savings_usd, 0);
  const delta = 84200 - currentTotal;
  if (all.length > 0 && delta !== 0) {
    const last = all[all.length - 1]!;
    last.savings_usd = Math.max(500, last.savings_usd + delta);
  }

  return all;
}

function buildRecommendations(
  findings: Finding[],
  auditId: string,
  orgId: string,
): Recommendation[] {
  return findings
    .filter((f) => f.savings_usd >= DEFAULT_RULES_CONFIG.min_savings_floor_usd)
    .map((f) => ({
      id: randomUUID(),
      audit_id: auditId,
      org_id: orgId,
      rule_id: f.rule_id,
      title: f.title,
      description: f.description,
      affected_count: f.affected_count,
      estimated_savings_annual: f.savings_usd,
      confidence: f.confidence,
      status: "draft" as const,
      implementation_status: "pending" as const,
      created_at: "2026-07-15T10:00:00.000Z",
      updated_at: "2026-07-15T10:00:00.000Z",
    }));
}

export function createSeedData(): SeedData {
  const orgId = SEED_IDS.consultancyOrg;
  const now = "2026-07-15T10:00:00.000Z";

  const organization: Organization = {
    id: orgId,
    type: "consultancy",
    name: "Vortex Optimizer Consulting",
    default_currency: "USD",
    default_locale: "en-US",
    settings: {
      rules_config: DEFAULT_RULES_CONFIG,
      multi_geo_disclaimer:
        "US analysis default; regional partner referral available for multi-geo clients.",
    },
  };

  const clients: Client[] = [
    {
      id: SEED_IDS.contosoClient,
      consultancy_id: orgId,
      name: "Contoso Ltd",
      industry: "Manufacturing",
      employee_count: 500,
      agreement_type: "EA",
      primary_renewal_date: "2027-03-01",
      annual_microsoft_spend_est: 892000,
      status: "active",
      created_at: now,
      updated_at: now,
    },
    {
      id: SEED_IDS.fabrikamClient,
      consultancy_id: orgId,
      name: "Fabrikam Inc",
      industry: "Professional Services",
      employee_count: 120,
      agreement_type: "CSP",
      primary_renewal_date: "2026-11-15",
      annual_microsoft_spend_est: 185000,
      status: "active",
      created_at: now,
      updated_at: now,
    },
  ];

  const contosoAudit: Audit = {
    id: SEED_IDS.contosoAudit,
    org_id: orgId,
    client_id: SEED_IDS.contosoClient,
    name: "FY26 M365 Optimization — Contoso",
    status: "analysis_complete",
    data_period_start: "2025-07-01",
    data_period_end: "2026-06-30",
    total_license_cost_annual: 892000,
    total_identified_savings: 84200,
    savings_percent: 9.44,
    rules_config: DEFAULT_RULES_CONFIG,
    data_quality: "complete",
    created_at: now,
    updated_at: now,
  };

  const fabrikamAudit: Audit = {
    id: SEED_IDS.fabrikamAudit,
    org_id: orgId,
    client_id: SEED_IDS.fabrikamClient,
    name: "CSP License Review — Fabrikam",
    status: "data_collection",
    total_license_cost_annual: 0,
    total_identified_savings: 0,
    savings_percent: 0,
    created_at: now,
    updated_at: now,
  };

  const licenseRecords = buildContosoLicenses(SEED_IDS.contosoAudit);
  const usageRecords = buildContosoUsage(SEED_IDS.contosoAudit);
  const findings = buildContosoFindings(SEED_IDS.contosoAudit);
  const recommendations = buildRecommendations(findings, SEED_IDS.contosoAudit, orgId);

  const criticalCount = findings.filter((f) => f.severity === "critical").length;
  const totalSavings = findings.reduce((s, f) => s + f.savings_usd, 0);

  const dashboard = {
    active_clients: 2,
    active_audits: 1,
    total_identified_savings_usd: Math.round(totalSavings),
    critical_findings: criticalCount,
    total_annual_spend_usd: 892000,
  };

  return {
    organization,
    clients,
    audits: [contosoAudit, fabrikamAudit],
    licenseRecords,
    usageRecords,
    findings,
    recommendations,
    dashboard,
  };
}

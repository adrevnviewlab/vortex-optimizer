import { randomUUID } from "node:crypto";
import type { RulesConfig } from "@vorzop/shared";
import { DEFAULT_RULES_CONFIG, mergeRulesConfig } from "@vorzop/shared";
import { duplicateSkuRule } from "./r02-duplicate-sku.js";
import { overlicensedRule } from "./r04-overlicensed.js";
import { premiumOnInactiveRule } from "./r03-premium-on-inactive.js";
import { unused90dRule } from "./r01-unused-90d.js";
import type { Rule, RuleContext, RuleEngineResult, RuleFinding } from "./types.js";
import type { LicenseRecord, UsageRecord } from "@vorzop/shared";

export const P0_RULES: Rule[] = [
  unused90dRule,
  duplicateSkuRule,
  premiumOnInactiveRule,
  overlicensedRule,
];

export interface RunRulesEngineInput {
  auditId: string;
  licenses: LicenseRecord[];
  usage: UsageRecord[];
  orgRulesConfig?: Partial<RulesConfig>;
  auditRulesConfig?: Partial<RulesConfig>;
  asOfDate?: Date;
}

function assessDataQuality(usage: UsageRecord[]): "complete" | "incomplete" {
  if (usage.length === 0) return "incomplete";
  const missingActivity = usage.filter(
    (u) => u.last_activity_date === null,
  ).length;
  const missingRatio = missingActivity / usage.length;
  return missingRatio > 0.2 ? "incomplete" : "complete";
}

function applyConfidenceModifier(
  finding: RuleFinding,
  dataQuality: "complete" | "incomplete",
  config: RulesConfig,
): RuleFinding {
  if (dataQuality === "complete") return finding;

  const modifier = config.confidence_modifiers.incomplete_usage_data;
  const levels: RuleFinding["confidence"][] = ["high", "medium", "low"];
  const idx = levels.indexOf(finding.confidence);
  const newIdx = Math.min(
    levels.length - 1,
    Math.max(0, idx + modifier),
  );

  return {
    ...finding,
    confidence: levels[newIdx] ?? "low",
    evidence: [
      ...finding.evidence,
      "Data quality: >20% usage rows missing last_activity_date",
    ],
  };
}

export function runRulesEngine(input: RunRulesEngineInput): RuleEngineResult {
  const config = mergeRulesConfig(
    input.orgRulesConfig ?? DEFAULT_RULES_CONFIG,
    input.auditRulesConfig ?? {},
  );

  const ctx: RuleContext = {
    auditId: input.auditId,
    licenses: input.licenses,
    usage: input.usage,
    config,
    asOfDate: input.asOfDate ?? new Date(),
  };

  const dataQuality = assessDataQuality(input.usage);
  let suppressedCount = 0;
  const rawFindings: RuleFinding[] = [];

  for (const rule of P0_RULES) {
    const ruleFindings = rule.execute(ctx);
    rawFindings.push(...ruleFindings);
  }

  const findings = rawFindings
    .map((f) => applyConfidenceModifier(f, dataQuality, config))
    .filter((f) => {
      if (f.savings_usd < config.min_savings_floor_usd) {
        suppressedCount++;
        return false;
      }
      return true;
    })
    .sort((a, b) => b.savings_usd - a.savings_usd);

  const totalSavingsUsd =
    Math.round(findings.reduce((sum, f) => sum + f.savings_usd, 0) * 100) /
    100;

  return {
    findings,
    dataQuality,
    totalSavingsUsd,
    suppressedCount,
  };
}

export function findingsToRecommendations(
  findings: RuleFinding[],
  auditId: string,
  orgId: string,
) {
  return findings.map((f) => ({
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
}

export function findingsWithIds(
  findings: RuleFinding[],
  auditId: string,
) {
  return findings.map((f) => ({
    ...f,
    id: randomUUID(),
    audit_id: auditId,
  }));
}

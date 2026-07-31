import type {
  Confidence,
  RuleFindingSeverity,
  LicenseRecord,
  RulesConfig,
  UsageRecord,
} from "@vorzop/shared";

export interface RuleContext {
  auditId: string;
  licenses: LicenseRecord[];
  usage: UsageRecord[];
  config: RulesConfig;
  /** Reference date for inactivity calculations (defaults to now) */
  asOfDate?: Date;
}

export interface RuleFinding {
  rule_id: string;
  title: string;
  description: string;
  users: string[];
  skus: string[];
  evidence: string[];
  affected_count: number;
  savings_usd: number;
  confidence: Confidence;
  severity: RuleFindingSeverity;
  metadata?: Record<string, unknown>;
}

export interface Rule {
  id: string;
  name: string;
  execute(ctx: RuleContext): RuleFinding[];
}

export interface RuleEngineResult {
  findings: RuleFinding[];
  dataQuality: "complete" | "incomplete";
  totalSavingsUsd: number;
  suppressedCount: number;
}

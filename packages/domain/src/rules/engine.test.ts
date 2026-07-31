import { describe, it, expect } from "vitest";
import type { LicenseRecord, UsageRecord } from "@vorzop/shared";
import { DEFAULT_RULES_CONFIG } from "@vorzop/shared";
import { unused90dRule } from "./r01-unused-90d.js";
import { duplicateSkuRule } from "./r02-duplicate-sku.js";
import { premiumOnInactiveRule } from "./r03-premium-on-inactive.js";
import { overlicensedRule } from "./r04-overlicensed.js";
import { runRulesEngine } from "./engine.js";

const AUDIT_ID = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const AS_OF = new Date("2026-07-31");

function license(
  sku: string,
  qty: number,
  unitCost: number,
): LicenseRecord {
  return {
    id: crypto.randomUUID(),
    audit_id: AUDIT_ID,
    sku,
    quantity: qty,
    unit_cost_annual: unitCost,
    extended_cost_annual: qty * unitCost,
  };
}

function usage(
  email: string,
  skus: string[],
  lastActivity: string | null,
  enabled = true,
): UsageRecord {
  return {
    id: crypto.randomUUID(),
    audit_id: AUDIT_ID,
    user_principal: email,
    assigned_skus: skus,
    last_activity_date: lastActivity,
    account_enabled: enabled,
  };
}

describe("R01 unused_90d", () => {
  it("flags enabled users with no activity beyond threshold", () => {
    const licenses = [license("Microsoft 365 E3", 100, 420)];
    const records = [
      usage("idle@contoso.com", ["Microsoft 365 E3"], "2026-01-01"),
      usage("active@contoso.com", ["Microsoft 365 E3"], "2026-07-20"),
    ];

    const findings = unused90dRule.execute({
      auditId: AUDIT_ID,
      licenses,
      usage: records,
      config: DEFAULT_RULES_CONFIG,
      asOfDate: AS_OF,
    });

    expect(findings).toHaveLength(1);
    const finding = findings[0]!;
    expect(finding.rule_id).toBe("unused_90d");
    expect(finding.users).toContain("idle@contoso.com");
    expect(finding.affected_count).toBe(1);
    expect(finding.savings_usd).toBe(420);
    expect(finding.severity).toBe("high");
  });

  it("ignores disabled accounts (handled by R03)", () => {
    const licenses = [license("Microsoft 365 E3", 10, 420)];
    const records = [
      usage("disabled@contoso.com", ["Microsoft 365 E3"], null, false),
    ];

    const findings = unused90dRule.execute({
      auditId: AUDIT_ID,
      licenses,
      usage: records,
      config: DEFAULT_RULES_CONFIG,
      asOfDate: AS_OF,
    });

    expect(findings).toHaveLength(0);
  });
});

describe("R02 duplicate_sku", () => {
  it("detects E3 + E5 overlap and saves cheaper SKU cost", () => {
    const licenses = [
      license("Microsoft 365 E3", 50, 420),
      license("Microsoft 365 E5", 50, 720),
    ];
    const records = [
      usage("overlap@contoso.com", ["Microsoft 365 E3", "Microsoft 365 E5"], "2026-07-01"),
    ];

    const findings = duplicateSkuRule.execute({
      auditId: AUDIT_ID,
      licenses,
      usage: records,
      config: DEFAULT_RULES_CONFIG,
      asOfDate: AS_OF,
    });

    expect(findings).toHaveLength(1);
    const finding = findings[0]!;
    expect(finding.rule_id).toBe("duplicate_sku");
    expect(finding.savings_usd).toBe(420);
    expect(finding.skus).toContain("Microsoft 365 E3");
    expect(finding.confidence).toBe("medium");
  });
});

describe("R03 premium_on_inactive", () => {
  it("flags premium SKU on disabled account", () => {
    const licenses = [license("Microsoft 365 E5", 10, 720)];
    const records = [
      usage("former@contoso.com", ["Microsoft 365 E5"], "2025-01-01", false),
    ];

    const findings = premiumOnInactiveRule.execute({
      auditId: AUDIT_ID,
      licenses,
      usage: records,
      config: DEFAULT_RULES_CONFIG,
      asOfDate: AS_OF,
    });

    expect(findings).toHaveLength(1);
    const finding = findings[0]!;
    expect(finding.rule_id).toBe("premium_on_inactive");
    expect(finding.savings_usd).toBe(720);
    expect(finding.severity).toBe("critical");
  });

  it("flags premium SKU on unused enabled account", () => {
    const licenses = [license("Microsoft 365 E5", 5, 720)];
    const records = [
      usage("ghost@contoso.com", ["Microsoft 365 E5"], "2025-06-01", true),
    ];

    const findings = premiumOnInactiveRule.execute({
      auditId: AUDIT_ID,
      licenses,
      usage: records,
      config: DEFAULT_RULES_CONFIG,
      asOfDate: AS_OF,
    });

    expect(findings).toHaveLength(1);
    expect(findings[0]!.savings_usd).toBe(720);
  });
});

describe("R04 overlicensed", () => {
  it("calculates excess seats beyond active users + buffer", () => {
    const licenses = [license("Microsoft 365 E3", 100, 420)];
    const records = Array.from({ length: 80 }, (_, i) =>
      usage(`user${i}@contoso.com`, ["Microsoft 365 E3"], "2026-07-15"),
    );

    const findings = overlicensedRule.execute({
      auditId: AUDIT_ID,
      licenses,
      usage: records,
      config: DEFAULT_RULES_CONFIG,
      asOfDate: AS_OF,
    });

    // 80 active + 5% buffer = 84 needed; 100 - 84 = 16 excess
    expect(findings).toHaveLength(1);
    const finding = findings[0]!;
    expect(finding.rule_id).toBe("overlicensed");
    expect(finding.affected_count).toBe(16);
    expect(finding.savings_usd).toBe(16 * 420);
    expect(finding.metadata?.active_users).toBe(80);
  });
});

describe("Rules engine pipeline", () => {
  it("suppresses findings below min_savings_floor_usd", () => {
    const licenses = [license("Microsoft Teams Essentials", 1, 100)];
    const records = [
      usage("tiny@contoso.com", ["Microsoft Teams Essentials"], "2025-01-01"),
    ];

    const result = runRulesEngine({
      auditId: AUDIT_ID,
      licenses,
      usage: records,
      auditRulesConfig: { min_savings_floor_usd: 500 },
      asOfDate: AS_OF,
    });

    expect(result.findings).toHaveLength(0);
    expect(result.suppressedCount).toBeGreaterThan(0);
  });

  it("marks data quality incomplete when >20% missing activity", () => {
    const licenses = [license("Microsoft 365 E3", 10, 420)];
    const records = [
      usage("a@contoso.com", ["Microsoft 365 E3"], null),
      usage("b@contoso.com", ["Microsoft 365 E3"], null),
      usage("c@contoso.com", ["Microsoft 365 E3"], "2026-07-01"),
    ];

    const result = runRulesEngine({
      auditId: AUDIT_ID,
      licenses,
      usage: records,
      asOfDate: AS_OF,
    });

    expect(result.dataQuality).toBe("incomplete");
  });
});

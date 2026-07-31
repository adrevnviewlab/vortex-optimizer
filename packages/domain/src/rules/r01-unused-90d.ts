import type { Rule, RuleContext, RuleFinding } from "./types.js";
import {
  buildSkuCostMap,
  daysSinceActivity,
  isExcludedDepartment,
  roundCurrency,
} from "./utils.js";

/**
 * R01 — unused_90d
 * Assigned SKU + (no activity OR activity > N days) + account enabled
 * Savings: qty × unit_cost (per affected user-seat)
 */
export const unused90dRule: Rule = {
  id: "unused_90d",
  name: "Unused License (90+ days inactive)",
  execute(ctx: RuleContext): RuleFinding[] {
    const { config, usage, licenses, asOfDate = new Date() } = ctx;
    const skuCosts = buildSkuCostMap(licenses);
    const threshold = config.unused_days_threshold;
    const findings: RuleFinding[] = [];
    const grouped = new Map<string, { users: string[]; skus: string[]; evidence: string[] }>();

    for (const record of usage) {
      if (!record.account_enabled) continue;
      if (isExcludedDepartment(record.department, config.exclude_departments)) {
        continue;
      }

      const days = daysSinceActivity(record.last_activity_date, asOfDate);
      const isUnused =
        days === null || days > threshold;

      if (!isUnused) continue;

      for (const sku of record.assigned_skus) {
        const key = `${record.user_principal}::${sku}`;
        if (!skuCosts.has(sku)) continue;

        const groupKey = sku;
        const existing = grouped.get(groupKey) ?? { users: [], skus: [sku], evidence: [] };
        existing.users.push(record.user_principal);
        existing.evidence.push(
          `${record.user_principal}: no activity for ${days ?? "unknown"} days (threshold ${threshold}d)`,
        );
        grouped.set(groupKey, existing);
        void key;
      }
    }

    for (const [sku, group] of grouped) {
      const unitCost = skuCosts.get(sku) ?? 0;
      const affectedCount = group.users.length;
      const savings = roundCurrency(affectedCount * unitCost);

      findings.push({
        rule_id: "unused_90d",
        title: `${affectedCount} unused ${sku} license(s)`,
        description: `Users assigned ${sku} with no sign-in activity exceeding ${threshold} days while account remains enabled.`,
        users: group.users,
        skus: [sku],
        evidence: group.evidence,
        affected_count: affectedCount,
        savings_usd: savings,
        confidence: "high",
        severity: "high",
        metadata: { threshold_days: threshold },
      });
    }

    return findings;
  },
};

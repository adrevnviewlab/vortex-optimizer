import type { Rule, RuleContext, RuleFinding } from "./types.js";
import {
  buildSkuCostMap,
  daysSinceActivity,
  isExcludedDepartment,
  roundCurrency,
} from "./utils.js";

/**
 * R03 — premium_on_inactive
 * Premium SKU on disabled OR unused account
 * Savings: full premium unit cost
 */
export const premiumOnInactiveRule: Rule = {
  id: "premium_on_inactive",
  name: "Premium SKU on Inactive Account",
  execute(ctx: RuleContext): RuleFinding[] {
    const { config, usage, licenses, asOfDate = new Date() } = ctx;
    const skuCosts = buildSkuCostMap(licenses);
    const premiumSet = new Set(config.premium_skus);
    const threshold = config.unused_days_threshold;
    const findings: RuleFinding[] = [];

    for (const record of usage) {
      if (isExcludedDepartment(record.department, config.exclude_departments)) {
        continue;
      }

      const premiumAssigned = record.assigned_skus.filter((sku) =>
        premiumSet.has(sku),
      );
      if (premiumAssigned.length === 0) continue;

      const days = daysSinceActivity(record.last_activity_date, asOfDate);
      const isDisabled = !record.account_enabled;
      const isUnused = days === null || days > threshold;

      if (!isDisabled && !isUnused) continue;

      for (const sku of premiumAssigned) {
        const unitCost = skuCosts.get(sku) ?? 0;
        const reason = isDisabled
          ? "account disabled"
          : `inactive ${days ?? "unknown"} days`;

        findings.push({
          rule_id: "premium_on_inactive",
          title: `Premium ${sku} on ${isDisabled ? "disabled" : "inactive"} account`,
          description: `${record.user_principal} has premium SKU ${sku} on ${reason}. Reclaim or reassign license.`,
          users: [record.user_principal],
          skus: [sku],
          evidence: [
            `${record.user_principal}: ${sku}, enabled=${record.account_enabled}, last_activity=${record.last_activity_date ?? "none"}`,
          ],
          affected_count: 1,
          savings_usd: roundCurrency(unitCost),
          confidence: "high",
          severity: "critical",
          metadata: { reason, disabled: isDisabled },
        });
      }
    }

    return findings;
  },
};

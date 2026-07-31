import type { Rule, RuleContext, RuleFinding } from "./types.js";
import { buildSkuCostMap, isExcludedDepartment, roundCurrency } from "./utils.js";

/**
 * R02 — duplicate_sku
 * Same user assigned 2+ overlapping SKUs in same category (e.g. E3 + E5)
 * Savings: cheaper SKU cost × overlap (remove redundant lower-tier license)
 */
export const duplicateSkuRule: Rule = {
  id: "duplicate_sku",
  name: "Duplicate SKU Overlap",
  execute(ctx: RuleContext): RuleFinding[] {
    const { config, usage } = ctx;
    const skuCosts = buildSkuCostMap(ctx.licenses);
    const findings: RuleFinding[] = [];

    for (const record of usage) {
      if (isExcludedDepartment(record.department, config.exclude_departments)) {
        continue;
      }

      for (const [category, skusInCategory] of Object.entries(
        config.duplicate_categories,
      )) {
        const assignedInCategory = record.assigned_skus.filter((sku) =>
          skusInCategory.includes(sku),
        );

        if (assignedInCategory.length < 2) continue;

        // Sort by cost descending — keep highest tier, remove cheaper duplicates
        const sorted = [...assignedInCategory].sort(
          (a, b) => (skuCosts.get(b) ?? 0) - (skuCosts.get(a) ?? 0),
        );
        const keepSku = sorted[0];
        if (!keepSku) continue;
        const removeSkus = sorted.slice(1);

        for (const removeSku of removeSkus) {
          const savings = roundCurrency(skuCosts.get(removeSku) ?? 0);
          findings.push({
            rule_id: "duplicate_sku",
            title: `Duplicate ${category} licenses for ${record.user_principal}`,
            description: `User has overlapping ${keepSku} and ${removeSku} in ${category}. Remove ${removeSku} — ${keepSku} provides superset coverage.`,
            users: [record.user_principal],
            skus: [keepSku, removeSku],
            evidence: [
              `Assigned: ${assignedInCategory.join(", ")}`,
              `Recommend removing: ${removeSku} ($${savings}/yr)`,
            ],
            affected_count: 1,
            savings_usd: savings,
            confidence: "medium",
            severity: "medium",
            metadata: { category, keep_sku: keepSku, remove_sku: removeSku },
          });
        }
      }
    }

    return findings;
  },
};

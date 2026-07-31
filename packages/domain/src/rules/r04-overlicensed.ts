import type { Rule, RuleContext, RuleFinding } from "./types.js";
import {
  buildSkuCostMap,
  buildSkuQuantityMap,
  countActiveUsersForSku,
  roundCurrency,
} from "./utils.js";

/**
 * R04 — overlicensed
 * Purchased qty > active users + buffer for SKU
 * Savings: (qty - needed) × unit_cost
 */
export const overlicensedRule: Rule = {
  id: "overlicensed",
  name: "Over-Licensed SKU",
  execute(ctx: RuleContext): RuleFinding[] {
    const { config, usage, licenses, asOfDate = new Date() } = ctx;
    const skuCosts = buildSkuCostMap(licenses);
    const skuQuantities = buildSkuQuantityMap(licenses);
    const bufferPercent = config.overlicense_buffer_percent;
    const threshold = config.unused_days_threshold;
    const findings: RuleFinding[] = [];

    for (const [sku, purchasedQty] of skuQuantities) {
      const activeUsers = countActiveUsersForSku(
        usage,
        sku,
        asOfDate,
        threshold,
      );
      const neededWithBuffer = Math.ceil(
        activeUsers * (1 + bufferPercent / 100),
      );

      if (purchasedQty <= neededWithBuffer) continue;

      const excessQty = purchasedQty - neededWithBuffer;
      const unitCost = skuCosts.get(sku) ?? 0;
      const savings = roundCurrency(excessQty * unitCost);

      findings.push({
        rule_id: "overlicensed",
        title: `Over-licensed ${sku}: ${excessQty} excess seat(s)`,
        description: `Purchased ${purchasedQty} ${sku} seats but only ${activeUsers} active users (+${bufferPercent}% buffer = ${neededWithBuffer} needed).`,
        users: [],
        skus: [sku],
        evidence: [
          `Purchased: ${purchasedQty}`,
          `Active users: ${activeUsers}`,
          `Needed with ${bufferPercent}% buffer: ${neededWithBuffer}`,
          `Excess: ${excessQty} × $${unitCost} = $${savings}`,
        ],
        affected_count: excessQty,
        savings_usd: savings,
        confidence: "medium",
        severity: "medium",
        metadata: {
          purchased_qty: purchasedQty,
          active_users: activeUsers,
          needed_with_buffer: neededWithBuffer,
          buffer_percent: bufferPercent,
        },
      });
    }

    return findings;
  },
};

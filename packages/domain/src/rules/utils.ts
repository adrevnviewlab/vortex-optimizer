import type { LicenseRecord, UsageRecord } from "@vorzop/shared";

/** Build SKU → unit cost lookup from license records */
export function buildSkuCostMap(
  licenses: LicenseRecord[],
): Map<string, number> {
  const map = new Map<string, number>();
  for (const lic of licenses) {
    const existing = map.get(lic.sku);
    if (existing === undefined || lic.unit_cost_annual > existing) {
      map.set(lic.sku, lic.unit_cost_annual);
    }
  }
  return map;
}

/** Build SKU → purchased quantity lookup */
export function buildSkuQuantityMap(
  licenses: LicenseRecord[],
): Map<string, number> {
  const map = new Map<string, number>();
  for (const lic of licenses) {
    map.set(lic.sku, (map.get(lic.sku) ?? 0) + lic.quantity);
  }
  return map;
}

export function daysSinceActivity(
  lastActivity: string | null,
  asOfDate: Date,
): number | null {
  if (!lastActivity) return null;
  const activity = new Date(lastActivity);
  const diffMs = asOfDate.getTime() - activity.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function isExcludedDepartment(
  department: string | undefined,
  excludeDepartments: string[],
): boolean {
  if (!department) return false;
  const normalized = department.toLowerCase().trim();
  return excludeDepartments.some(
    (d) => normalized.includes(d.toLowerCase()),
  );
}

export function countActiveUsersForSku(
  usage: UsageRecord[],
  sku: string,
  asOfDate: Date,
  unusedDaysThreshold: number,
): number {
  return usage.filter((u) => {
    if (!u.account_enabled) return false;
    if (!u.assigned_skus.includes(sku)) return false;
    const days = daysSinceActivity(u.last_activity_date, asOfDate);
    if (days === null) return false;
    return days <= unusedDaysThreshold;
  }).length;
}

export function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}

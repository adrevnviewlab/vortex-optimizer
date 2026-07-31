import { randomUUID } from "node:crypto";

export type ParsedLicenseRow = {
  sku: string;
  quantity: number;
  costMonthly: number;
};

export type ParsedUsageRow = {
  userPrincipal: string;
  assignedSkus: string[];
  lastActivityDate: string | null;
  accountEnabled: boolean;
  department?: string;
};

function parseCsvLines(csv: string): string[][] {
  const lines = csv.trim().split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length <= 1) return [];
  return lines.slice(1).map((line) => {
    const cells: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]!;
      if (ch === '"') {
        inQuotes = !inQuotes;
        continue;
      }
      if (ch === "," && !inQuotes) {
        cells.push(current.trim());
        current = "";
        continue;
      }
      current += ch;
    }
    cells.push(current.trim());
    return cells;
  });
}

function headerIndex(headers: string[], ...names: string[]): number {
  const normalized = headers.map((h) => h.toLowerCase().replace(/[\s_-]+/g, ""));
  for (const name of names) {
    const key = name.toLowerCase().replace(/[\s_-]+/g, "");
    const idx = normalized.indexOf(key);
    if (idx >= 0) return idx;
  }
  return -1;
}

export function parseLicenseCsv(csv: string): ParsedLicenseRow[] {
  const lines = csv.trim().split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length <= 1) return [];

  const headers = lines[0]!.split(",").map((h) => h.trim());
  const skuIdx = headerIndex(headers, "sku", "product", "license");
  const qtyIdx = headerIndex(headers, "qty", "quantity", "count", "licensedusers");
  const costIdx = headerIndex(headers, "cost", "costmonthly", "unitcost", "price");

  if (skuIdx < 0) {
    throw new Error("CSV must include a sku column");
  }

  const rows = parseCsvLines(csv);
  const aggregated = new Map<string, ParsedLicenseRow>();

  for (const cells of rows) {
    const sku = cells[skuIdx]?.trim();
    if (!sku) continue;
    const quantity = qtyIdx >= 0 ? Number.parseInt(cells[qtyIdx] ?? "0", 10) : 1;
    const rawCost = costIdx >= 0 ? Number.parseFloat(cells[costIdx] ?? "0") : 0;
    const costMonthly = rawCost > 500 ? rawCost / 12 : rawCost;

    const existing = aggregated.get(sku) ?? { sku, quantity: 0, costMonthly: 0 };
    existing.quantity += Number.isFinite(quantity) ? quantity : 0;
    existing.costMonthly += Number.isFinite(costMonthly) ? costMonthly : 0;
    aggregated.set(sku, existing);
  }

  return [...aggregated.values()];
}

export function parseUsageCsv(csv: string): ParsedUsageRow[] {
  const lines = csv.trim().split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length <= 1) return [];

  const headers = lines[0]!.split(",").map((h) => h.trim());
  const upnIdx = headerIndex(headers, "userprincipal", "email", "upn", "user");
  const skuIdx = headerIndex(headers, "assignedskus", "skus", "sku", "licenses");
  const activityIdx = headerIndex(headers, "lastactivitydate", "lastsignin", "lastactivity");
  const enabledIdx = headerIndex(headers, "accountenabled", "enabled", "active");
  const deptIdx = headerIndex(headers, "department", "dept");

  if (upnIdx < 0) {
    throw new Error("Usage CSV must include user_principal or email column");
  }

  const rows = parseCsvLines(csv);
  return rows.map((cells) => {
    const userPrincipal = cells[upnIdx]?.trim() || `${randomUUID()}@import.local`;
    const skuRaw = skuIdx >= 0 ? cells[skuIdx] ?? "" : "";
    const assignedSkus = skuRaw
      .split(/[|;]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const enabledRaw = enabledIdx >= 0 ? cells[enabledIdx]?.toLowerCase() : "true";
    const accountEnabled = enabledRaw !== "false" && enabledRaw !== "0" && enabledRaw !== "no";

    return {
      userPrincipal,
      assignedSkus: assignedSkus.length > 0 ? assignedSkus : ["Unknown SKU"],
      lastActivityDate: activityIdx >= 0 ? cells[activityIdx]?.trim() || null : null,
      accountEnabled,
      department: deptIdx >= 0 ? cells[deptIdx]?.trim() : undefined,
    };
  });
}

export function parseCsvRowCount(csv: string): number {
  const lines = csv.trim().split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length <= 1) return 0;
  return lines.length - 1;
}

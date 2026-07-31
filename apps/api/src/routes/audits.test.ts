import { describe, it, expect } from "vitest";
import { parseLicenseCsv, parseUsageCsv } from "../lib/csv-parser.js";

describe("csv parser", () => {
  it("parses license CSV rows", () => {
    const csv = "sku,qty,cost\nMicrosoft 365 E3,10,420\nMicrosoft 365 E5,5,720";
    const rows = parseLicenseCsv(csv);
    expect(rows).toHaveLength(2);
    expect(rows[0]!.sku).toBe("Microsoft 365 E3");
    expect(rows[0]!.quantity).toBe(10);
  });

  it("parses usage CSV rows", () => {
    const csv =
      "email,assigned_skus,last_activity_date,account_enabled\nuser@contoso.com,Microsoft 365 E3,2026-07-01,true";
    const rows = parseUsageCsv(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.userPrincipal).toBe("user@contoso.com");
    expect(rows[0]!.assignedSkus).toContain("Microsoft 365 E3");
  });
});

describe("audit analysis API routes", () => {
  it("placeholder — integration tests require seeded DB + JWT", () => {
    expect(true).toBe(true);
  });
});

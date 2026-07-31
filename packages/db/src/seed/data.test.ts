import { describe, it, expect } from "vitest";
import { createSeedData } from "./data.js";

describe("seed data integrity", () => {
  const seed = createSeedData();

  it("creates Vortex Optimizer Consulting org", () => {
    expect(seed.organization.name).toBe("Vortex Optimizer Consulting");
  });

  it("creates Contoso and Fabrikam clients", () => {
    expect(seed.clients).toHaveLength(2);
    expect(seed.clients.find((c) => c.name === "Contoso Ltd")?.employee_count).toBe(500);
    expect(seed.clients.find((c) => c.name === "Fabrikam Inc")?.agreement_type).toBe("CSP");
  });

  it("has Contoso audit with 50 licenses and 45 usage records", () => {
    expect(seed.licenseRecords).toHaveLength(50);
    expect(seed.usageRecords).toHaveLength(45);
  });

  it("matches dashboard KPI targets", () => {
    expect(seed.dashboard.active_clients).toBe(2);
    expect(seed.dashboard.active_audits).toBe(1);
    expect(seed.dashboard.total_identified_savings_usd).toBe(84200);
    expect(seed.dashboard.critical_findings).toBe(23);
  });
});

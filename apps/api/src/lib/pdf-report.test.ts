import { describe, it, expect, beforeEach } from "vitest";
import { buildReportContent } from "./report-template.js";
import { generateReportPdf } from "./pdf-report.js";
import { createDownloadToken, verifyDownloadToken } from "./download-token.js";
import { resetEnvCache } from "./env.js";

describe("pdf report", () => {
  beforeEach(() => {
    resetEnvCache();
    process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
  });

  it("generates a non-empty PDF buffer", async () => {
    const content = buildReportContent(
      {
        id: "audit-1",
        orgId: "org-1",
        clientId: "client-1",
        title: "Contoso Q3 Audit",
        status: "completed",
        source: "csv",
        spendTotal: 96800,
        savingsEstimate: 17400,
        startedAt: "2026-07-01T00:00:00.000Z",
        completedAt: "2026-07-28T00:00:00.000Z",
        createdBy: null,
        createdAt: "2026-07-01T00:00:00.000Z",
        updatedAt: "2026-07-28T00:00:00.000Z",
      },
      "Contoso Ltd",
      [{ sku: "Microsoft 365 E5", quantity: 100, assigned: 55, costMonthly: 3600 }],
      [
        {
          title: "Inactive E5 licenses",
          description: "Users inactive 90+ days",
          severity: "high",
          savingsEstimate: 8400,
        },
      ],
      [{ action: "Downgrade inactive users", status: "pending", priority: 1 }],
    );

    const pdf = await generateReportPdf(content);
    expect(pdf.byteLength).toBeGreaterThan(500);
    expect(Buffer.from(pdf).subarray(0, 4).toString()).toBe("%PDF");
  });
});

describe("download token", () => {
  beforeEach(() => {
    resetEnvCache();
    process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
  });

  it("creates and verifies signed download tokens", () => {
    const orgId = "11111111-1111-1111-1111-111111111111";
    const reportId = "22222222-2222-2222-2222-222222222222";
    const token = createDownloadToken(orgId, reportId);

    expect(verifyDownloadToken(token, orgId, reportId)).toBe(true);
    expect(verifyDownloadToken(token, orgId, "other-report")).toBe(false);
  });
});

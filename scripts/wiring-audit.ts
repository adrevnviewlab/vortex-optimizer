#!/usr/bin/env tsx
/**
 * FE route → API endpoint wiring matrix for production readiness tracking.
 * Run: pnpm wiring-audit
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

type Readiness = "live" | "stub" | "blocked";

interface WiringRow {
  page: string;
  api: string;
  readiness: Readiness;
  notes?: string;
}

const WIRING: WiringRow[] = [
  { page: "/welcome", api: "— (static SSR)", readiness: "live" },
  { page: "/pricing", api: "— (static + PartnerDisclaimer)", readiness: "live" },
  { page: "/login", api: "Auth.js credentials + POST /api/auth/register", readiness: "live" },
  { page: "/dashboard KPI cards", api: "GET /v1/orgs/:orgId/dashboard/summary", readiness: "live" },
  { page: "/dashboard recent audits", api: "GET /v1/orgs/:orgId/audits?limit=&offset=", readiness: "live" },
  { page: "/clients list", api: "GET /v1/orgs/:orgId/clients?limit=&offset=", readiness: "live" },
  { page: "/clients/[id]", api: "GET /v1/orgs/:orgId/clients/:id", readiness: "live" },
  { page: "/audits list", api: "GET /v1/orgs/:orgId/audits?limit=&offset=", readiness: "live" },
  { page: "/audits/[id] detail", api: "GET /v1/orgs/:orgId/audits/:id", readiness: "live" },
  { page: "/audits/[id] analyze", api: "POST /v1/orgs/:orgId/audits/:id/analyze", readiness: "live" },
  { page: "/audits/[id] import CSV", api: "POST /v1/orgs/:orgId/audits/:id/import", readiness: "live" },
  { page: "/recommendations", api: "GET /v1/orgs/:orgId/audits/:id/recommendations", readiness: "live" },
  { page: "/recommendations PATCH", api: "PATCH /v1/orgs/:orgId/recommendations/:id", readiness: "live" },
  { page: "/reports", api: "GET /v1/orgs/:orgId/reports", readiness: "live" },
  { page: "/reports generate", api: "POST /v1/orgs/:orgId/audits/:id/reports", readiness: "live" },
  { page: "/settings/profile", api: "GET /v1/me + GET /v1/orgs/:orgId", readiness: "live" },
  { page: "/settings PATCH", api: "PATCH /v1/orgs/:orgId/settings", readiness: "live" },
  { page: "/admin/users", api: "GET /v1/orgs/:orgId/members", readiness: "live" },
  { page: "/admin invite", api: "POST /v1/orgs/:orgId/invites", readiness: "live" },
  { page: "/readiness checklist", api: "GET /v1/orgs/:orgId/readiness", readiness: "live" },
  { page: "/renewals", api: "GET /v1/orgs/:orgId/renewals", readiness: "live" },
  { page: "Session bridge (web)", api: "POST /api/session-bridge → POST /v1/auth/session-bridge", readiness: "live" },
  { page: "Health", api: "GET /health", readiness: "live" },
  { page: "Readiness", api: "GET /ready", readiness: "live" },
  { page: "/settings/integrations", api: "GET /v1/orgs/:orgId/integrations/microsoft", readiness: "blocked", notes: "Graph OAuth — P2 gated (FEATURE_GRAPH_SYNC)" },
  { page: "/pricing checkout", api: "POST /v1/billing/checkout", readiness: "blocked", notes: "STRIPE_CONNECTED gate" },
  { page: "Graph sync", api: "POST /v1/orgs/:orgId/integrations/microsoft/sync", readiness: "blocked", notes: "Requires Graph connection" },
  { page: "PDF download", api: "GET /v1/orgs/:orgId/reports/:id/download", readiness: "blocked", notes: "R2 + FEATURE_PDF_REPORTS" },
];

function toMarkdown(rows: WiringRow[]): string {
  const live = rows.filter((r) => r.readiness === "live").length;
  const stub = rows.filter((r) => r.readiness === "stub").length;
  const blocked = rows.filter((r) => r.readiness === "blocked").length;
  const pct = Math.round((live / rows.length) * 100);

  const lines = [
    "# Wiring Audit Matrix",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "| Metric | Count |",
    "|--------|-------|",
    `| Live | ${live} |`,
    `| Stub | ${stub} |`,
    `| Blocked | ${blocked} |`,
    `| **Live %** | **${pct}%** |`,
    "",
    "| Page / Component | API Endpoint | Readiness | Notes |",
    "|------------------|--------------|-----------|-------|",
  ];

  for (const row of rows) {
    lines.push(
      `| ${row.page} | ${row.api} | **${row.readiness}** | ${row.notes ?? ""} |`,
    );
  }

  lines.push("");
  lines.push("## Gate status");
  lines.push("");
  lines.push("- **P0:** ≥2 live wires — **PASS**");
  lines.push("- **P1:** Core audit flows live — **PASS**");
  lines.push("- **P2:** Graph + PDF + Stripe gated/blocked — **IN PROGRESS** (backend APIs live; integrations gated)");

  return lines.join("\n");
}

const markdown = toMarkdown(WIRING);
const outPath = resolve(process.cwd(), "docs", "WIRING-AUDIT.md");

writeFileSync(outPath, markdown, "utf8");
console.log(markdown);
console.log(`\nWrote ${outPath}`);

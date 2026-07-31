import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { createDb } from "../index.js";
import {
  organizations,
  users,
  organizationMembers,
  sessions,
  clients,
  audits,
  auditFindings,
  recommendations,
  licenseSnapshots,
  usageRecords,
  renewalPlans,
} from "../schema/index.js";
import { createSeedData } from "./data.js";
import { SEED_IDS } from "../types.js";

const DEMO_USER_ID = "22222222-2222-4222-8222-222222222222";
const DEMO_SESSION_TOKEN = "demo-session-token-vortex-optimizer";

async function seed() {
  const domainSeed = createSeedData();

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.log("DATABASE_URL not set — domain seed summary only:");
    console.log(`  Organization: ${domainSeed.organization.name}`);
    console.log(`  Clients: ${domainSeed.clients.map((c) => c.name).join(", ")}`);
    console.log(`  License records: ${domainSeed.licenseRecords.length}`);
    console.log(`  Usage records: ${domainSeed.usageRecords.length}`);
    console.log(`  Findings: ${domainSeed.findings.length}`);
    console.log("  Dashboard KPIs:", domainSeed.dashboard);
    return;
  }

  const db = createDb(databaseUrl);

  const existing = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.slug, "vortex-optimizer-consulting"))
    .limit(1);

  if (existing.length > 0) {
    console.log("Demo data already seeded. Skipping.");
    return;
  }

  const passwordHash = await bcrypt.hash("demo-password", 10);
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const orgId = SEED_IDS.consultancyOrg;
  const contosoId = SEED_IDS.contosoClient;
  const fabrikamId = SEED_IDS.fabrikamClient;
  const auditId = SEED_IDS.contosoAudit;

  await db.transaction(async (tx) => {
    await tx.insert(organizations).values({
      id: orgId,
      name: "Vortex Optimizer Consulting",
      slug: "vortex-optimizer-consulting",
      region: "US",
      tier: "consultancy",
      settings: domainSeed.organization.settings,
    });

    await tx.insert(users).values({
      id: DEMO_USER_ID,
      email: "admin@vortexoptimizer.com",
      name: "Demo Admin",
      passwordHash,
    });

    await tx.insert(organizationMembers).values({
      orgId,
      userId: DEMO_USER_ID,
      role: "owner",
      joinedAt: new Date(),
    });

    await tx.insert(sessions).values({
      sessionToken: DEMO_SESSION_TOKEN,
      userId: DEMO_USER_ID,
      expires,
    });

    await tx.insert(clients).values([
      {
        id: contosoId,
        orgId,
        name: "Contoso Ltd",
        industry: "Manufacturing",
        employeeCount: 500,
        renewalDate: new Date("2027-03-01T00:00:00Z"),
        region: "US",
        status: "active",
        metadata: { agreement_type: "EA" },
      },
      {
        id: fabrikamId,
        orgId,
        name: "Fabrikam Inc",
        industry: "Professional Services",
        employeeCount: 120,
        renewalDate: new Date("2026-11-15T00:00:00Z"),
        region: "US",
        status: "active",
        metadata: { agreement_type: "CSP" },
      },
    ]);

    await tx.insert(audits).values({
      id: auditId,
      orgId,
      clientId: contosoId,
      title: "FY26 M365 Optimization — Contoso",
      status: "in_progress",
      source: "seed",
      spendTotal: String(domainSeed.dashboard.total_annual_spend_usd),
      savingsEstimate: String(domainSeed.dashboard.total_identified_savings_usd),
      startedAt: new Date("2026-07-01T00:00:00Z"),
      createdBy: DEMO_USER_ID,
    });

    const findingRows = await tx
      .insert(auditFindings)
      .values(
        domainSeed.findings.map((f) => ({
          auditId,
          category: mapRuleToCategory(f.rule_id),
          severity: f.severity,
          title: f.title,
          description: f.description,
          affectedCount: f.affected_count,
          savingsEstimate: String(f.savings_usd),
          sku: f.skus[0] ?? null,
          metadata: { rule_id: f.rule_id, users: f.users },
        })),
      )
      .returning({ id: auditFindings.id, title: auditFindings.title });

    await tx.insert(recommendations).values(
      findingRows.slice(0, 8).map((finding, index) => {
        const seedRec = domainSeed.recommendations[index];
        return {
          auditId,
          findingId: finding.id,
          priority: index + 1,
          action: seedRec?.title ?? `Implement remediation for: ${finding.title}`,
          status: "pending" as const,
          implementationStatus: "pending" as const,
          metadata: seedRec
            ? {
                rule_id: seedRec.rule_id,
                title: seedRec.title,
                description: seedRec.description,
                affected_count: seedRec.affected_count,
                estimated_savings_annual: seedRec.estimated_savings_annual,
                confidence: seedRec.confidence,
              }
            : {},
        };
      }),
    );

    const skuAggregates = aggregateLicenses(domainSeed.licenseRecords);
    await tx.insert(licenseSnapshots).values(
      skuAggregates.map((snapshot) => ({
        auditId,
        sku: snapshot.sku,
        quantity: snapshot.quantity,
        assigned: snapshot.assigned,
        costMonthly: String(Math.round(snapshot.costMonthly * 100) / 100),
      })),
    );

    await tx.insert(usageRecords).values(
      domainSeed.usageRecords.map((u) => ({
        auditId,
        clientId: contosoId,
        sku: u.assigned_skus[0] ?? "Unknown",
        activeUsers: u.account_enabled ? 1 : 0,
        licensedUsers: 1,
        metadata: {
          user_principal: u.user_principal,
          assigned_skus: u.assigned_skus,
          last_activity_date: u.last_activity_date,
          account_enabled: u.account_enabled,
          department: u.department,
        },
      })),
    );

    await tx.insert(renewalPlans).values({
      orgId,
      clientId: contosoId,
      renewalDate: new Date("2027-03-01T00:00:00Z"),
      scenarios: [
        {
          id: "baseline",
          name: "Baseline renewal",
          description: "Maintain current SKU mix with 5% vendor discount target",
          projected_savings_annual: 42000,
        },
      ],
      notes: "EA renewal window opens 180 days prior",
    });
  });

  console.log("Seed complete.");
  console.log(`  Org ID:        ${orgId}`);
  console.log(`  Contoso audit: ${auditId}`);
  console.log(`  Savings:       $${domainSeed.dashboard.total_identified_savings_usd}`);
  console.log(`  Critical:      ${domainSeed.dashboard.critical_findings}`);
}

function mapRuleToCategory(ruleId: string) {
  switch (ruleId) {
    case "duplicate_sku":
      return "overlap" as const;
    case "unused_90d":
      return "usage" as const;
    case "premium_on_inactive":
      return "license" as const;
    case "overlicensed":
      return "license" as const;
    default:
      return "license" as const;
  }
}

function aggregateLicenses(
  records: ReturnType<typeof createSeedData>["licenseRecords"],
) {
  const map = new Map<string, { quantity: number; costMonthly: number }>();
  for (const r of records) {
    const existing = map.get(r.sku) ?? { quantity: 0, costMonthly: 0 };
    existing.quantity += r.quantity;
    existing.costMonthly += (r.extended_cost_annual ?? r.quantity * r.unit_cost_annual) / 12;
    map.set(r.sku, existing);
  }
  return [...map.entries()].map(([sku, data]) => ({
    sku,
    quantity: data.quantity,
    assigned: Math.max(0, Math.floor(data.quantity * 0.85)),
    costMonthly: data.costMonthly,
  }));
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});

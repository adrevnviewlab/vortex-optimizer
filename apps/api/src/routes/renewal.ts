import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { audits, clients, licenseSnapshots, renewalPlans } from "@vorzop/db";
import { patchRenewalPlanSchema, type RenewalPlanDto } from "@vorzop/shared";
import { getDb } from "../lib/db.js";
import { logAuditEvent } from "../lib/audit-events.js";
import { jsonWithMeta, readinessMiddleware } from "../lib/response.js";
import { authMiddleware, getUserId } from "../middleware/auth.js";
import { getOrgId, orgScopeMiddleware } from "../middleware/org.js";

export const renewalRoutes = new Hono();

renewalRoutes.use("*", authMiddleware);
renewalRoutes.use("/:orgId/*", orgScopeMiddleware);

renewalRoutes.get("/:orgId/renewals", readinessMiddleware("live"), async (c) => {
  const orgId = getOrgId(c);
  const db = getDb();

  const clientRows = await db
    .select({
      planId: renewalPlans.id,
      clientId: clients.id,
      clientName: clients.name,
      renewalDate: sql<Date | null>`coalesce(${renewalPlans.renewalDate}, ${clients.renewalDate})`,
      scenarios: renewalPlans.scenarios,
      employeeCount: clients.employeeCount,
    })
    .from(clients)
    .leftJoin(
      renewalPlans,
      and(eq(renewalPlans.clientId, clients.id), eq(renewalPlans.orgId, orgId)),
    )
    .where(
      and(
        eq(clients.orgId, orgId),
        sql`coalesce(${renewalPlans.renewalDate}, ${clients.renewalDate}) is not null`,
      ),
    )
    .orderBy(asc(sql`coalesce(${renewalPlans.renewalDate}, ${clients.renewalDate})`));

  const auditRows = await db
    .select({
      clientId: audits.clientId,
      spendTotal: audits.spendTotal,
      auditId: audits.id,
      createdAt: audits.createdAt,
    })
    .from(audits)
    .where(and(eq(audits.orgId, orgId), sql`${audits.clientId} is not null`))
    .orderBy(desc(audits.createdAt));

  const metricsByClient = new Map<string, { spend: number; licenses: number }>();
  const latestAuditByClient = new Map<string, string>();

  for (const row of auditRows) {
    if (!row.clientId || latestAuditByClient.has(row.clientId)) continue;
    latestAuditByClient.set(row.clientId, row.auditId);
  }

  const latestAuditIds = [...latestAuditByClient.values()];
  const snapshotCounts =
    latestAuditIds.length > 0
      ? await db
          .select({
            auditId: licenseSnapshots.auditId,
            quantity: sql<number>`coalesce(sum(${licenseSnapshots.quantity}), 0)::int`,
          })
          .from(licenseSnapshots)
          .where(inArray(licenseSnapshots.auditId, latestAuditIds))
          .groupBy(licenseSnapshots.auditId)
      : [];

  const licensesByAudit = new Map(
    snapshotCounts.map((row) => [row.auditId, row.quantity]),
  );

  for (const row of auditRows) {
    if (!row.clientId || metricsByClient.has(row.clientId)) continue;
    metricsByClient.set(row.clientId, {
      spend: Number(row.spendTotal ?? 0),
      licenses: licensesByAudit.get(row.auditId) ?? 0,
    });
  }


  const payload = clientRows
    .filter((row) => row.renewalDate != null)
    .map((row) => {
      const metrics = metricsByClient.get(row.clientId);
      return {
        id: row.planId ?? row.clientId,
        clientId: row.clientId,
        clientName: row.clientName,
        renewalDate: row.renewalDate!.toISOString(),
        licenses: metrics?.licenses ?? row.employeeCount ?? 0,
        monthlySpend:
          metrics?.spend ?? Math.round((row.employeeCount ?? 100) * 120),
        scenario: formatRenewalScenario(row.scenarios),
      };
    });

  return jsonWithMeta(c, payload);
});

renewalRoutes.get(
  "/:orgId/clients/:clientId/renewal",
  readinessMiddleware("live"),
  async (c) => {
    const orgId = getOrgId(c);
    const clientId = c.req.param("clientId")!;
    const db = getDb();

    const clientRows = await db
      .select()
      .from(clients)
      .where(and(eq(clients.orgId, orgId), eq(clients.id, clientId)))
      .limit(1);

    if (clientRows.length === 0) {
      return c.json({ error: "Client not found", meta: { readiness: "live" } }, 404);
    }

    const planRows = await db
      .select()
      .from(renewalPlans)
      .where(and(eq(renewalPlans.orgId, orgId), eq(renewalPlans.clientId, clientId)))
      .limit(1);

    if (planRows.length === 0) {
      const client = clientRows[0]!;
      const [created] = await db
        .insert(renewalPlans)
        .values({
          orgId,
          clientId,
          renewalDate: client.renewalDate,
          scenarios: [],
        })
        .returning();
      return jsonWithMeta(c, mapRenewalPlan(created!));
    }

    return jsonWithMeta(c, mapRenewalPlan(planRows[0]!));
  },
);

renewalRoutes.patch(
  "/:orgId/clients/:clientId/renewal",
  readinessMiddleware("live"),
  zValidator("json", patchRenewalPlanSchema),
  async (c) => {
    const orgId = getOrgId(c);
    const clientId = c.req.param("clientId")!;
    const actorId = getUserId(c);
    const patch = c.req.valid("json");
    const db = getDb();

    const clientRows = await db
      .select()
      .from(clients)
      .where(and(eq(clients.orgId, orgId), eq(clients.id, clientId)))
      .limit(1);

    if (clientRows.length === 0) {
      return c.json({ error: "Client not found", meta: { readiness: "live" } }, 404);
    }

    const existing = await db
      .select()
      .from(renewalPlans)
      .where(and(eq(renewalPlans.orgId, orgId), eq(renewalPlans.clientId, clientId)))
      .limit(1);

    let plan;
    if (existing.length === 0) {
      [plan] = await db
        .insert(renewalPlans)
        .values({
          orgId,
          clientId,
          renewalDate: patch.renewalDate ? new Date(patch.renewalDate) : clientRows[0]!.renewalDate,
          scenarios: patch.scenarios ?? [],
          notes: patch.notes ?? null,
          alertDays: patch.alertDays ?? [90, 180],
        })
        .returning();
    } else {
      [plan] = await db
        .update(renewalPlans)
        .set({
          ...(patch.renewalDate !== undefined
            ? { renewalDate: patch.renewalDate ? new Date(patch.renewalDate) : null }
            : {}),
          ...(patch.scenarios !== undefined ? { scenarios: patch.scenarios } : {}),
          ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
          ...(patch.alertDays !== undefined ? { alertDays: patch.alertDays } : {}),
          updatedAt: new Date(),
        })
        .where(eq(renewalPlans.id, existing[0]!.id))
        .returning();
    }

    await logAuditEvent(db, {
      orgId,
      actorId,
      action: "renewal.updated",
      resource: `clients/${clientId}/renewal`,
    });

    return jsonWithMeta(c, mapRenewalPlan(plan!));
  },
);

function formatRenewalScenario(scenarios: unknown): string {
  if (!Array.isArray(scenarios) || scenarios.length === 0) {
    return "Renewal planning";
  }

  const first = scenarios[0] as Record<string, unknown>;
  const name = typeof first.name === "string" ? first.name : "";
  const description =
    typeof first.description === "string" ? first.description : "";

  if (name && description) return `${name} — ${description}`;
  return name || description || "Renewal planning";
}

function mapRenewalPlan(plan: typeof renewalPlans.$inferSelect): RenewalPlanDto {
  return {
    id: plan.id,
    orgId: plan.orgId,
    clientId: plan.clientId,
    renewalDate: plan.renewalDate?.toISOString() ?? null,
    scenarios: (plan.scenarios ?? []) as Array<Record<string, unknown>>,
    notes: plan.notes,
    alertDays: plan.alertDays ?? [90, 180],
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
  };
}

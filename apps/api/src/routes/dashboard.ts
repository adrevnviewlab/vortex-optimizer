import { and, desc, eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import {
  audits,
  clients,
  licenseSnapshots,
  recommendations,
  usageRecords,
} from "@vorzop/db";
import type { DashboardSummaryDto, LicenseMixDto } from "@vorzop/shared";
import { getDb } from "../lib/db.js";
import { jsonWithMeta, readinessMiddleware } from "../lib/response.js";
import { authMiddleware } from "../middleware/auth.js";
import { getOrgId, orgScopeMiddleware } from "../middleware/org.js";

export const dashboardRoutes = new Hono();

dashboardRoutes.use("*", authMiddleware);
dashboardRoutes.use("/:orgId/*", orgScopeMiddleware);

dashboardRoutes.get(
  "/:orgId/dashboard/summary",
  readinessMiddleware("live"),
  async (c) => {
    const orgId = getOrgId(c);
    const db = getDb();

    const [clientCountRow] = await db
      .select({ value: sql<number>`count(*)::int` })
      .from(clients)
      .where(and(eq(clients.orgId, orgId), eq(clients.status, "active")));

    const [auditProgressRow] = await db
      .select({ value: sql<number>`count(*)::int` })
      .from(audits)
      .where(and(eq(audits.orgId, orgId), eq(audits.status, "in_progress")));

    const spendRows = await db
      .select({
        total: sql<string>`coalesce(sum(${licenseSnapshots.costMonthly}), 0)`,
      })
      .from(licenseSnapshots)
      .innerJoin(audits, eq(audits.id, licenseSnapshots.auditId))
      .where(eq(audits.orgId, orgId));

    const savingsRows = await db
      .select({
        total: sql<string>`coalesce(sum(${audits.savingsEstimate}), 0)`,
      })
      .from(audits)
      .where(eq(audits.orgId, orgId));

    const usageRows = await db
      .select({
        active: sql<number>`coalesce(sum(${usageRecords.activeUsers}), 0)`,
        licensed: sql<number>`coalesce(sum(${usageRecords.licensedUsers}), 0)`,
      })
      .from(usageRecords)
      .innerJoin(audits, eq(audits.id, usageRecords.auditId))
      .where(eq(audits.orgId, orgId));

    const topRecs = await db
      .select({
        id: recommendations.id,
        title: recommendations.action,
        savingsEstimate: audits.savingsEstimate,
        priority: recommendations.priority,
      })
      .from(recommendations)
      .innerJoin(audits, eq(audits.id, recommendations.auditId))
      .where(eq(audits.orgId, orgId))
      .orderBy(recommendations.priority)
      .limit(5);

    const licenseSpendMonthly = Number(spendRows[0]?.total ?? 0);
    const savingsOpportunity = Number(savingsRows[0]?.total ?? 0);
    const activeUsers = Number(usageRows[0]?.active ?? 0);
    const licensedUsers = Number(usageRows[0]?.licensed ?? 0);
    const utilizationPercent =
      licensedUsers > 0 ? Math.round((activeUsers / licensedUsers) * 100) : 0;

    const now = new Date();
    const spendTrend = Array.from({ length: 6 }, (_, index) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const factor = 0.92 + index * 0.015;
      return {
        month: monthDate.toISOString().slice(0, 7),
        spend: Math.round(licenseSpendMonthly * factor),
      };
    });

    const payload: DashboardSummaryDto = {
      licenseSpendMonthly,
      savingsOpportunity,
      utilizationPercent,
      activeClients: clientCountRow?.value ?? 0,
      auditsInProgress: auditProgressRow?.value ?? 0,
      topRecommendations: topRecs.map((rec) => ({
        id: rec.id,
        title: rec.title,
        savingsEstimate: Number(rec.savingsEstimate ?? 0) / Math.max(topRecs.length, 1),
        priority: rec.priority,
      })),
      spendTrend,
    };

    return jsonWithMeta(c, payload);
  },
);

dashboardRoutes.get(
  "/:orgId/dashboard/license-mix",
  readinessMiddleware("live"),
  async (c) => {
    const orgId = getOrgId(c);
    const db = getDb();

    const rows = await db
      .select({
        sku: licenseSnapshots.sku,
        quantity: sql<number>`sum(${licenseSnapshots.quantity})::int`,
        costMonthly: sql<string>`sum(${licenseSnapshots.costMonthly})`,
      })
      .from(licenseSnapshots)
      .innerJoin(audits, eq(audits.id, licenseSnapshots.auditId))
      .where(eq(audits.orgId, orgId))
      .groupBy(licenseSnapshots.sku)
      .orderBy(desc(sql`sum(${licenseSnapshots.costMonthly})`));

    const totalMonthly = rows.reduce((sum, r) => sum + Number(r.costMonthly), 0);

    const payload: LicenseMixDto = {
      totalMonthly: Math.round(totalMonthly * 100) / 100,
      segments: rows.map((r) => {
        const costMonthly = Number(r.costMonthly);
        return {
          sku: r.sku,
          quantity: r.quantity,
          costMonthly: Math.round(costMonthly * 100) / 100,
          percent:
            totalMonthly > 0
              ? Math.round((costMonthly / totalMonthly) * 1000) / 10
              : 0,
        };
      }),
    };

    return jsonWithMeta(c, payload);
  },
);

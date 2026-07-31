import { and, eq, sql } from "drizzle-orm";
import {
  graphConnections,
  graphSyncJobs,
  syncedLicenses,
  syncedUsers,
} from "@vorzop/db";
import type { Env } from "../lib/env.js";
import { getEnv } from "../lib/env.js";
import { getDb } from "../lib/db.js";
import {
  fetchAllGraphUsers,
  fetchAllSubscribedSkus,
  fetchOrganizationTenantId,
} from "../lib/graph-client.js";
import { refreshAccessToken } from "../lib/graph-oauth.js";
import {
  transformGraphSubscribedSkus,
  transformGraphUsers,
} from "../lib/graph-transform.js";
import { decryptSecret, encryptSecret } from "../lib/token-crypto.js";

export type GraphSyncResult = {
  jobId: string;
  recordsProcessed: number;
  usersSynced: number;
  licensesSynced: number;
};

async function ensureFreshAccessToken(
  env: Env,
  connection: typeof graphConnections.$inferSelect,
): Promise<string> {
  const now = Date.now();
  const expiresAt = connection.expiresAt?.getTime() ?? 0;

  if (expiresAt > now + 60_000) {
    return decryptSecret(connection.accessTokenEncrypted);
  }

  if (!connection.refreshTokenEncrypted) {
    throw new Error("Access token expired and no refresh token available");
  }

  const refreshToken = decryptSecret(connection.refreshTokenEncrypted);
  const tokens = await refreshAccessToken(env, refreshToken);
  const db = getDb();

  await db
    .update(graphConnections)
    .set({
      accessTokenEncrypted: encryptSecret(tokens.access_token),
      refreshTokenEncrypted: tokens.refresh_token
        ? encryptSecret(tokens.refresh_token)
        : connection.refreshTokenEncrypted,
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
      updatedAt: new Date(),
    })
    .where(eq(graphConnections.id, connection.id));

  return tokens.access_token;
}

export async function runGraphSync(
  orgId: string,
  type: "full" | "users" | "licenses" = "full",
): Promise<GraphSyncResult> {
  const env = getEnv();
  const db = getDb();

  const [connection] = await db
    .select()
    .from(graphConnections)
    .where(and(eq(graphConnections.orgId, orgId), eq(graphConnections.status, "active")))
    .limit(1);

  if (!connection) {
    throw new Error("No active Microsoft Graph connection for this organization");
  }

  const [job] = await db
    .insert(graphSyncJobs)
    .values({
      connectionId: connection.id,
      orgId,
      type,
      status: "running",
      startedAt: new Date(),
    })
    .returning();

  if (!job) {
    throw new Error("Failed to create sync job");
  }

  try {
    const accessToken = await ensureFreshAccessToken(env, connection);
    let usersSynced = 0;
    let licensesSynced = 0;

    if (type === "full" || type === "users") {
      const graphUsers = await fetchAllGraphUsers(accessToken);
      const userRecords = transformGraphUsers(graphUsers);
      const syncedAt = new Date();

      for (const user of userRecords) {
        await db
          .insert(syncedUsers)
          .values({
            orgId,
            graphId: user.graphId,
            upn: user.upn,
            displayName: user.displayName,
            assignedLicenses: user.assignedLicenses,
            syncedAt,
          })
          .onConflictDoUpdate({
            target: [syncedUsers.orgId, syncedUsers.graphId],
            set: {
              upn: user.upn,
              displayName: user.displayName,
              assignedLicenses: user.assignedLicenses,
              syncedAt,
            },
          });
      }

      usersSynced = userRecords.length;
    }

    if (type === "full" || type === "licenses") {
      const graphSkus = await fetchAllSubscribedSkus(accessToken);
      const licenseRecords = transformGraphSubscribedSkus(graphSkus);
      const syncedAt = new Date();

      for (const license of licenseRecords) {
        await db
          .insert(syncedLicenses)
          .values({
            orgId,
            skuId: license.skuId,
            skuPartNumber: license.skuPartNumber,
            skuName: license.skuName,
            total: license.total,
            consumed: license.consumed,
            syncedAt,
          })
          .onConflictDoUpdate({
            target: [syncedLicenses.orgId, syncedLicenses.skuId],
            set: {
              skuPartNumber: license.skuPartNumber,
              skuName: license.skuName,
              total: license.total,
              consumed: license.consumed,
              syncedAt,
            },
          });
      }

      licensesSynced = licenseRecords.length;
    }

    const recordsProcessed = usersSynced + licensesSynced;
    const lastSyncAt = new Date();

    await db
      .update(graphSyncJobs)
      .set({
        status: "complete",
        finishedAt: lastSyncAt,
        recordsProcessed,
      })
      .where(eq(graphSyncJobs.id, job.id));

    await db
      .update(graphConnections)
      .set({
        lastSyncAt,
        lastError: null,
        updatedAt: lastSyncAt,
      })
      .where(eq(graphConnections.id, connection.id));

    return {
      jobId: job.id,
      recordsProcessed,
      usersSynced,
      licensesSynced,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Graph sync failed";

    await db
      .update(graphSyncJobs)
      .set({
        status: "failed",
        finishedAt: new Date(),
        error: message,
      })
      .where(eq(graphSyncJobs.id, job.id));

    await db
      .update(graphConnections)
      .set({
        status: "error",
        lastError: message,
        updatedAt: new Date(),
      })
      .where(eq(graphConnections.id, connection.id));

    throw error;
  }
}

export async function upsertGraphConnection(input: {
  orgId: string;
  tenantId: string;
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  scopes: string[];
}): Promise<string> {
  const db = getDb();
  const now = new Date();
  const expiresAt = new Date(Date.now() + input.expiresIn * 1000);

  const values = {
    orgId: input.orgId,
    tenantId: input.tenantId,
    accessTokenEncrypted: encryptSecret(input.accessToken),
    refreshTokenEncrypted: input.refreshToken
      ? encryptSecret(input.refreshToken)
      : null,
    scopes: input.scopes,
    consentedAt: now,
    expiresAt,
    status: "active" as const,
    lastError: null,
    updatedAt: now,
  };

  const [row] = await db
    .insert(graphConnections)
    .values(values)
    .onConflictDoUpdate({
      target: graphConnections.orgId,
      set: {
        tenantId: input.tenantId,
        accessTokenEncrypted: values.accessTokenEncrypted,
        refreshTokenEncrypted: values.refreshTokenEncrypted,
        scopes: input.scopes,
        consentedAt: now,
        expiresAt,
        status: "active",
        lastError: null,
        updatedAt: now,
      },
    })
    .returning({ id: graphConnections.id });

  if (!row) {
    throw new Error("Failed to persist Graph connection");
  }

  return row.id;
}

export async function resolveTenantIdFromToken(accessToken: string): Promise<string> {
  return fetchOrganizationTenantId(accessToken);
}

export async function countSyncedRecords(orgId: string): Promise<{
  users: number;
  licenses: number;
}> {
  const db = getDb();
  const [userCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(syncedUsers)
    .where(eq(syncedUsers.orgId, orgId));
  const [licenseCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(syncedLicenses)
    .where(eq(syncedLicenses.orgId, orgId));

  return {
    users: userCount?.count ?? 0,
    licenses: licenseCount?.count ?? 0,
  };
}

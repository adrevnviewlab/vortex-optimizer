import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { clients } from "@vorzop/db";
import {
  createClientSchema,
  paginationQuerySchema,
  updateClientSchema,
  type ClientDto,
} from "@vorzop/shared";
import { getDb } from "../lib/db.js";
import { logAuditEvent } from "../lib/audit-events.js";
import { jsonWithMeta, readinessMiddleware } from "../lib/response.js";
import { authMiddleware, getUserId } from "../middleware/auth.js";
import { getOrgId, orgScopeMiddleware } from "../middleware/org.js";

export const clientRoutes = new Hono();

clientRoutes.use("*", authMiddleware);
clientRoutes.use("/:orgId/*", orgScopeMiddleware);

clientRoutes.get("/:orgId/clients", readinessMiddleware("live"), async (c) => {
  const orgId = getOrgId(c);
  const db = getDb();
  const { limit, offset } = paginationQuerySchema.parse({
    limit: c.req.query("limit"),
    offset: c.req.query("offset"),
  });

  const rows = await db
    .select()
    .from(clients)
    .where(eq(clients.orgId, orgId))
    .orderBy(desc(clients.createdAt))
    .limit(limit)
    .offset(offset);

  return jsonWithMeta(c, rows.map(mapClient));
});

clientRoutes.post(
  "/:orgId/clients",
  readinessMiddleware("live"),
  zValidator("json", createClientSchema),
  async (c) => {
    const orgId = getOrgId(c);
    const actorId = getUserId(c);
    const input = c.req.valid("json");
    const db = getDb();

    const [created] = await db
      .insert(clients)
      .values({
        orgId,
        name: input.name,
        industry: input.industry,
        employeeCount: input.employeeCount,
        renewalDate: input.renewalDate ? new Date(input.renewalDate) : undefined,
        region: input.region,
        status: input.status,
      })
      .returning();

    await logAuditEvent(db, {
      orgId,
      actorId,
      action: "client.created",
      resource: `clients/${created!.id}`,
      metadata: { name: input.name },
    });

    return c.json({ data: mapClient(created!), meta: { readiness: "live" } }, 201);
  },
);

clientRoutes.patch(
  "/:orgId/clients/:clientId",
  readinessMiddleware("live"),
  zValidator("json", updateClientSchema),
  async (c) => {
    const orgId = getOrgId(c);
    const clientId = c.req.param("clientId")!;
    const actorId = getUserId(c);
    const input = c.req.valid("json");
    const db = getDb();

    const existing = await db
      .select()
      .from(clients)
      .where(and(eq(clients.orgId, orgId), eq(clients.id, clientId)))
      .limit(1);

    if (existing.length === 0) {
      return c.json({ error: "Client not found", meta: { readiness: "live" } }, 404);
    }

    const [updated] = await db
      .update(clients)
      .set({
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.industry !== undefined ? { industry: input.industry } : {}),
        ...(input.employeeCount !== undefined
          ? { employeeCount: input.employeeCount }
          : {}),
        ...(input.renewalDate !== undefined
          ? {
              renewalDate: input.renewalDate ? new Date(input.renewalDate) : null,
            }
          : {}),
        ...(input.region !== undefined ? { region: input.region } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        updatedAt: new Date(),
      })
      .where(eq(clients.id, clientId))
      .returning();

    await logAuditEvent(db, {
      orgId,
      actorId,
      action: "client.updated",
      resource: `clients/${clientId}`,
    });

    return jsonWithMeta(c, mapClient(updated!));
  },
);

clientRoutes.delete("/:orgId/clients/:clientId", readinessMiddleware("live"), async (c) => {
  const orgId = getOrgId(c);
  const clientId = c.req.param("clientId")!;
  const actorId = getUserId(c);
  const db = getDb();

  const deleted = await db
    .delete(clients)
    .where(and(eq(clients.orgId, orgId), eq(clients.id, clientId)))
    .returning({ id: clients.id });

  if (deleted.length === 0) {
    return c.json({ error: "Client not found", meta: { readiness: "live" } }, 404);
  }

  await logAuditEvent(db, {
    orgId,
    actorId,
    action: "client.deleted",
    resource: `clients/${clientId}`,
  });

  return jsonWithMeta(c, { id: clientId, deleted: true });
});

function mapClient(client: typeof clients.$inferSelect): ClientDto {
  return {
    id: client.id,
    orgId: client.orgId,
    name: client.name,
    industry: client.industry,
    employeeCount: client.employeeCount,
    renewalDate: client.renewalDate?.toISOString() ?? null,
    region: client.region,
    status: client.status,
    createdAt: client.createdAt.toISOString(),
    updatedAt: client.updatedAt.toISOString(),
  };
}

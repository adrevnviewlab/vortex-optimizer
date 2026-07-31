import { auditEvents } from "@vorzop/db";
import type { Db } from "@vorzop/db";

export async function logAuditEvent(
  db: Db,
  input: {
    orgId: string;
    actorId?: string | null;
    action: string;
    resource: string;
    metadata?: Record<string, unknown>;
  },
) {
  const [row] = await db
    .insert(auditEvents)
    .values({
      orgId: input.orgId,
      actorId: input.actorId ?? null,
      action: input.action,
      resource: input.resource,
      metadata: input.metadata ?? {},
    })
    .returning();
  return row;
}

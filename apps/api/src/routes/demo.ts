import { Hono } from "hono";
import { demoSessions, generateToken, hashToken } from "@vorzop/db";
import type { DemoSessionDto } from "@vorzop/shared";
import { getDb } from "../lib/db.js";
import { jsonWithMeta, readinessMiddleware } from "../lib/response.js";
import { authMiddleware, getUserId } from "../middleware/auth.js";

export const demoRoutes = new Hono();

demoRoutes.post("/sessions", authMiddleware, readinessMiddleware("live"), async (c) => {
  const actorId = getUserId(c);
  const db = getDb();

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

  await db.insert(demoSessions).values({
    tokenHash: hashToken(token),
    expiresAt,
    createdBy: actorId,
  });

  const payload: DemoSessionDto = {
    token,
    expiresAt: expiresAt.toISOString(),
  };

  return jsonWithMeta(c, payload);
});

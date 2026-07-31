import { createDb, type Db } from "@vorzop/db";
import { sql } from "drizzle-orm";
import { getEnv } from "./env.js";

let db: Db | null = null;

export function getDb(): Db {
  if (!db) {
    db = createDb(getEnv().DATABASE_URL);
  }
  return db;
}

export async function checkDbConnection(): Promise<boolean> {
  try {
    const database = getDb();
    await database.execute(sql`SELECT 1`);
    return true;
  } catch {
    return false;
  }
}

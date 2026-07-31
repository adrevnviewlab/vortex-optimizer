import { createDb, type Db } from "@vorzop/db";

let cached: Db | null = null;

export function getDb(): Db {
  if (cached) return cached;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is required for authentication");
  }

  cached = createDb(url);
  return cached;
}

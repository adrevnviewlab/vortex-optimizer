import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { resetEnvCache } from "./env.js";
import {
  getStorageBackend,
  uploadReportObject,
  readReportObject,
  serializeStoredObject,
  parseStoredObject,
} from "./storage.js";

describe("storage", () => {
  let tempRoot: string;

  beforeEach(async () => {
    resetEnvCache();
    tempRoot = await mkdtemp(join(tmpdir(), "vorzop-storage-test-"));
    process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
    process.env.REPORT_STORAGE_PATH = tempRoot;
    delete process.env.S3_BUCKET;
    delete process.env.S3_ACCESS_KEY_ID;
    delete process.env.S3_SECRET_ACCESS_KEY;
  });

  afterEach(async () => {
    resetEnvCache();
    await rm(tempRoot, { recursive: true, force: true });
  });

  it("uses filesystem backend when S3 is not configured", () => {
    expect(getStorageBackend()).toBe("filesystem");
  });

  it("round-trips report bytes via filesystem storage", async () => {
    const key = "reports/test/report.pdf";
    const body = Buffer.from("%PDF-1.4 test content");

    const stored = await uploadReportObject(key, body);
    expect(stored.backend).toBe("filesystem");

    const read = await readReportObject(stored);
    expect(read.equals(body)).toBe(true);
  });

  it("serializes and parses stored object metadata", () => {
    const stored = { backend: "filesystem" as const, key: "reports/a/b.pdf" };
    const metadata = serializeStoredObject(stored);
    const parsed = parseStoredObject(metadata);
    expect(parsed).toEqual(stored);
  });
});

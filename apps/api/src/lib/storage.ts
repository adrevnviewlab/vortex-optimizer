import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getEnv } from "./env.js";

export type StorageBackend = "s3" | "filesystem" | "inline";

export type StoredObject = {
  backend: StorageBackend;
  key: string;
  /** Dev-only inline base64 when filesystem is unavailable */
  inlineBase64?: string;
};

export type UploadResult = StoredObject;

export function getStorageBackend(): StorageBackend {
  const env = getEnv();
  if (env.S3_BUCKET && env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY) {
    return "s3";
  }
  return "filesystem";
}

function getFilesystemRoot(): string {
  const env = getEnv();
  return env.REPORT_STORAGE_PATH ?? join(tmpdir(), "vorzop-reports");
}

function createS3Client(): S3Client {
  const env = getEnv();
  return new S3Client({
    region: env.S3_REGION ?? "auto",
    endpoint: env.S3_ENDPOINT || undefined,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID!,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: Boolean(env.S3_ENDPOINT),
  });
}

export async function uploadReportObject(
  key: string,
  body: Buffer,
  contentType = "application/pdf",
): Promise<UploadResult> {
  const backend = getStorageBackend();

  if (backend === "s3") {
    const env = getEnv();
    const client = createS3Client();
    await client.send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET!,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
    return { backend: "s3", key };
  }

  const filePath = join(getFilesystemRoot(), key);
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, body);
  return { backend: "filesystem", key };
}

export async function readReportObject(stored: StoredObject): Promise<Buffer> {
  if (stored.backend === "inline" && stored.inlineBase64) {
    return Buffer.from(stored.inlineBase64, "base64");
  }

  if (stored.backend === "s3") {
    const env = getEnv();
    const client = createS3Client();
    const response = await client.send(
      new GetObjectCommand({
        Bucket: env.S3_BUCKET!,
        Key: stored.key,
      }),
    );
    const bytes = await response.Body?.transformToByteArray();
    if (!bytes) throw new Error("Empty object body from S3");
    return Buffer.from(bytes);
  }

  const filePath = join(getFilesystemRoot(), stored.key);
  return readFile(filePath);
}

export async function getPresignedDownloadUrl(
  stored: StoredObject,
  expiresInSeconds = 900,
): Promise<string | null> {
  if (stored.backend !== "s3") return null;

  const env = getEnv();
  const client = createS3Client();
  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: env.S3_BUCKET!,
      Key: stored.key,
    }),
    { expiresIn: expiresInSeconds },
  );
}

export function parseStoredObject(metadata: Record<string, unknown>): StoredObject | null {
  const backend = metadata.storage_backend as StorageBackend | undefined;
  const key = metadata.storage_key as string | undefined;
  if (!backend || !key) return null;

  return {
    backend,
    key,
    inlineBase64: metadata.inline_base64 as string | undefined,
  };
}

export function serializeStoredObject(stored: StoredObject): Record<string, unknown> {
  return {
    storage_backend: stored.backend,
    storage_key: stored.key,
    ...(stored.inlineBase64 ? { inline_base64: stored.inlineBase64 } : {}),
  };
}

/** Documented dev-only fallback when filesystem writes fail */
export async function uploadReportWithFallback(
  key: string,
  body: Buffer,
): Promise<UploadResult> {
  try {
    return await uploadReportObject(key, body);
  } catch {
    return {
      backend: "inline",
      key,
      inlineBase64: body.toString("base64"),
    };
  }
}

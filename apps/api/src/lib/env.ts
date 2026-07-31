import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  APP_URL: z.string().url().default("http://localhost:3000"),
  API_URL: z.string().url().default("http://localhost:4000"),
  DATABASE_URL: z.string().min(1),
  API_JWT_SECRET: z.string().min(16).optional(),
  STRIPE_CONNECTED: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_AUDIT: z.string().optional(),
  STRIPE_PRICE_RETAINER: z.string().optional(),
  STRIPE_PRICE_ENTERPRISE: z.string().optional(),
  FEATURE_GRAPH_SYNC: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  FEATURE_STRIPE: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  FEATURE_PDF_REPORTS: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  S3_ENDPOINT: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_REGION: z.string().default("auto"),
  REPORT_STORAGE_PATH: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  GRAPH_CLIENT_ID: z.string().optional(),
  GRAPH_CLIENT_SECRET: z.string().optional(),
  GRAPH_REDIRECT_URI: z.string().url().optional(),
  GRAPH_WEBHOOK_SECRET: z.string().optional(),
  TOKEN_ENCRYPTION_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (cached) return cached;

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join("; ");
    throw new Error(`Invalid environment: ${message}`);
  }

  cached = parsed.data;
  return cached;
}

export function resetEnvCache(): void {
  cached = null;
}

export function getJwtSecret(): string {
  const env = getEnv();
  if (env.API_JWT_SECRET) return env.API_JWT_SECRET;
  if (env.NODE_ENV === "development" || env.NODE_ENV === "test") {
    return "dev-jwt-secret-change-in-production-min-16-chars";
  }
  throw new Error("API_JWT_SECRET is required in non-development environments");
}

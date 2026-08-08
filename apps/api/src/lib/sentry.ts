import * as Sentry from "@sentry/node";

let initialized = false;

/**
 * Initialize Sentry when SENTRY_DSN is set. Safe no-op otherwise (app boots without Sentry).
 */
export function initSentry(): void {
  if (initialized) return;

  const dsn = process.env.SENTRY_DSN?.trim();
  if (!dsn) return;

  const tracesSampleRate = Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? "0.1");

  Sentry.init({
    dsn,
    tracesSampleRate: Number.isFinite(tracesSampleRate) ? tracesSampleRate : 0.1,
  });

  initialized = true;
}

export function captureException(error: unknown): void {
  if (!process.env.SENTRY_DSN?.trim()) return;
  Sentry.captureException(error);
}

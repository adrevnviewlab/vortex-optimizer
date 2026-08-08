import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  // Client bundle only inlines NEXT_PUBLIC_* — default 0.1 when unset
  const tracesSampleRate = Number(
    process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? "0.1",
  );

  Sentry.init({
    dsn,
    tracesSampleRate: Number.isFinite(tracesSampleRate) ? tracesSampleRate : 0.1,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

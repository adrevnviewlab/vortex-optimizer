import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  transpilePackages: ["@vorzop/ui"],
  experimental: {
    optimizePackageImports: ["lucide-react", "@vorzop/ui"],
  },
};

const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: sentryAuthToken,
  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,
  // Skip source map upload when no auth token (local / turbo builds without Sentry)
  sourcemaps: {
    disable: !sentryAuthToken,
  },
  widenClientFileUpload: Boolean(sentryAuthToken),
});

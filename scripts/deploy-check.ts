#!/usr/bin/env tsx
/**
 * Validates required environment variables before deploy.
 * Usage:
 *   pnpm deploy:check              # all targets
 *   pnpm deploy:check --target=web
 *   pnpm deploy:check --target=api
 */

type Target = "web" | "api" | "all";

interface EnvRule {
  key: string;
  minLength?: number;
  mustBeUrl?: boolean;
  mustNotContain?: string[];
}

const WEB_RULES: EnvRule[] = [
  { key: "AUTH_SECRET", minLength: 32 },
  { key: "AUTH_URL", mustBeUrl: true },
  { key: "DATABASE_URL", minLength: 10, mustNotContain: ["localhost"] },
  { key: "NEXT_PUBLIC_API_URL", mustBeUrl: true },
  { key: "API_URL", mustBeUrl: true },
];

const API_RULES: EnvRule[] = [
  { key: "NODE_ENV", minLength: 4 },
  { key: "APP_URL", mustBeUrl: true },
  { key: "DATABASE_URL", minLength: 10, mustNotContain: ["localhost"] },
  { key: "API_JWT_SECRET", minLength: 16 },
];

function parseTarget(argv: string[]): Target {
  const flag = argv.find((a) => a.startsWith("--target="));
  if (!flag) return "all";
  const value = flag.split("=")[1] as Target;
  if (value === "web" || value === "api" || value === "all") return value;
  console.error(`Invalid --target=${value}. Use web, api, or all.`);
  process.exit(2);
}

function checkRule(rule: EnvRule): string[] {
  const errors: string[] = [];
  const raw = process.env[rule.key];
  const value = raw?.trim() ?? "";

  if (!value) {
    errors.push(`${rule.key} is missing`);
    return errors;
  }

  if (rule.minLength && value.length < rule.minLength) {
    errors.push(`${rule.key} must be at least ${rule.minLength} characters`);
  }

  if (rule.mustBeUrl) {
    try {
      new URL(value);
    } catch {
      errors.push(`${rule.key} must be a valid URL (${value})`);
    }
  }

  if (rule.mustNotContain?.some((needle) => value.includes(needle))) {
    errors.push(`${rule.key} must not contain "${rule.mustNotContain.join('" or "')}" in production`);
  }

  return errors;
}

function runRules(label: string, rules: EnvRule[]): string[] {
  const errors = rules.flatMap(checkRule);
  if (errors.length === 0) {
    console.log(`✓ ${label}: ${rules.length} required vars OK`);
  } else {
    console.error(`✗ ${label}:`);
    for (const err of errors) console.error(`  - ${err}`);
  }
  return errors;
}

function main() {
  const target = parseTarget(process.argv.slice(2));
  const allErrors: string[] = [];

  console.log("Vortex Optimizer — deploy env check\n");

  if (target === "web" || target === "all") {
    allErrors.push(...runRules("Vercel (web)", WEB_RULES));
  }

  if (target === "api" || target === "all") {
    allErrors.push(...runRules("Render (api)", API_RULES));
  }

  if (allErrors.length > 0) {
    console.error(`\nDeploy check failed (${allErrors.length} issue(s)).`);
    console.error("See docs/PRODUCTION-CHECKLIST.md and docs/RUNBOOK.md.");
    process.exit(1);
  }

  console.log("\nDeploy check passed.");
}

main();

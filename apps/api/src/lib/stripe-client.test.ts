import { describe, it, expect, beforeEach } from "vitest";
import {
  checkoutModeForPlan,
  resetStripeClientCache,
  isStripeLive,
  resolveStripePriceId,
} from "./stripe-client.js";
import { resetEnvCache } from "./env.js";

describe("stripe client helpers", () => {
  beforeEach(() => {
    resetEnvCache();
    resetStripeClientCache();
    process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
    process.env.STRIPE_CONNECTED = "false";
    process.env.FEATURE_STRIPE = "false";
    delete process.env.STRIPE_SECRET_KEY;
  });

  it("reports stripe as blocked when not connected", () => {
    expect(isStripeLive()).toBe(false);
  });

  it("reports stripe as live when fully configured", () => {
    process.env.STRIPE_CONNECTED = "true";
    process.env.FEATURE_STRIPE = "true";
    process.env.STRIPE_SECRET_KEY = "sk_test_example";
    resetEnvCache();
    expect(isStripeLive()).toBe(true);
  });

  it("maps audit plan to one-time checkout mode", () => {
    expect(checkoutModeForPlan("audit")).toBe("payment");
    expect(checkoutModeForPlan("retainer")).toBe("subscription");
  });

  it("resolves configured price IDs", () => {
    process.env.STRIPE_PRICE_AUDIT = "price_audit_123";
    resetEnvCache();
    expect(resolveStripePriceId("audit")).toBe("price_audit_123");
  });
});

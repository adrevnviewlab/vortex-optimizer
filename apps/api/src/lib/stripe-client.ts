import Stripe from "stripe";
import { getEnv } from "./env.js";

let cached: Stripe | null | undefined;

export function resetStripeClientCache(): void {
  cached = undefined;
}

export function getStripeClient(): Stripe | null {
  if (cached !== undefined) return cached;

  const env = getEnv();
  if (!env.STRIPE_SECRET_KEY) {
    cached = null;
    return null;
  }

  cached = new Stripe(env.STRIPE_SECRET_KEY);
  return cached;
}

export function isStripeLive(): boolean {
  const env = getEnv();
  return Boolean(
    env.STRIPE_CONNECTED &&
      env.FEATURE_STRIPE &&
      env.STRIPE_SECRET_KEY,
  );
}

export type CheckoutPlan = "audit" | "retainer" | "quarterly" | "enterprise";

export function resolveStripePriceId(plan: CheckoutPlan): string | null {
  const env = getEnv();
  switch (plan) {
    case "audit":
      return env.STRIPE_PRICE_AUDIT ?? null;
    case "retainer":
      return env.STRIPE_PRICE_RETAINER ?? null;
    case "quarterly":
      return env.STRIPE_PRICE_RETAINER ?? null;
    case "enterprise":
      return env.STRIPE_PRICE_ENTERPRISE ?? null;
    default:
      return null;
  }
}

export function checkoutModeForPlan(plan: CheckoutPlan): Stripe.Checkout.SessionCreateParams.Mode {
  return plan === "audit" ? "payment" : "subscription";
}

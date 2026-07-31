"use client";

import { useCallback, useEffect, useState } from "react";
import { PartnerDisclaimer, PricingTable, useToast } from "@vorzop/ui";
import {
  createBillingCheckout,
  fetchBillingStatus,
} from "@/lib/api-client";

export default function PricingPageClient() {
  const { addToast } = useToast();
  const [stripeConnected, setStripeConnected] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchBillingStatus().then(({ status }) => {
      setStripeConnected(status?.connected ?? false);
    });
  }, []);

  const handleCheckout = useCallback(
    async (plan: "audit" | "retainer" | "enterprise") => {
      setCheckoutLoading(plan);
      const { checkoutUrl, error } = await createBillingCheckout(plan);
      setCheckoutLoading(null);

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
        return;
      }

      addToast({
        title: "Checkout unavailable",
        description: error ?? "Stripe is not connected",
        variant: "warning",
      });
    },
    [addToast],
  );

  return (
    <section className="mx-auto max-w-[var(--content-max-width)] px-4 py-16 md:px-6">
      <div className="mb-12 text-center">
        <h1
          className="font-semibold tracking-[var(--tracking-tight)]"
          style={{
            fontFamily: "var(--font-display-family)",
            fontSize: "var(--font-h1)",
          }}
        >
          Simple, transparent pricing
        </h1>
        <p className="mt-3 text-[var(--font-body)] text-[var(--text-secondary)]">
          All prices in USD. Choose the plan that fits your advisory practice.
        </p>
      </div>

      <PricingTable
        stripeConnected={stripeConnected}
        onCheckout={handleCheckout}
        checkoutLoading={checkoutLoading}
      />
      <PartnerDisclaimer />

      <div className="mt-16">
        <h2 className="mb-6 text-center text-[var(--font-h2)] font-semibold">FAQ</h2>
        <div className="mx-auto max-w-2xl space-y-4">
          {[
            {
              q: "Do you resell Microsoft licenses?",
              a: "No. Vortex Optimizer is an independent advisory platform — we help you optimize spend, not sell licenses.",
            },
            {
              q: "What data formats do you support?",
              a: "CSV and Excel exports from Microsoft 365 admin center, Azure, and common SAM tools.",
            },
            {
              q: "Can clients access reports directly?",
              a: "Yes. Professional and Enterprise plans include a read-only client portal.",
            },
            {
              q: "Is my data secure?",
              a: "All data is encrypted at rest and in transit. We never share client data with Microsoft or resellers.",
            },
            {
              q: "What about non-US clients?",
              a: "USD is our default currency. Regional partners may offer localized pricing — see disclaimer above.",
            },
          ].map((item) => (
            <details
              key={item.q}
              className="rounded-[var(--card-radius)] border border-[var(--border-default)] bg-[var(--surface-raised)] p-4"
            >
              <summary className="cursor-pointer text-[var(--font-body-sm)] font-semibold">
                {item.q}
              </summary>
              <p className="mt-2 text-[var(--font-body-sm)] text-[var(--text-secondary)]">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Card,
  MarketingCtaBand,
  PartnerDisclaimer,
  PricingComparisonTable,
  PricingTable,
  RoiCalculator,
  SectionHeader,
  useToast,
} from "@vorzop/ui";
import {
  createBillingCheckout,
  fetchBillingStatus,
} from "@/lib/api-client";

const FAQ = [
  {
    q: "Do you resell Microsoft licenses?",
    a: "No. Vortex Optimizer is an independent advisory platform — we help you optimize spend and compliance. We are not a Microsoft CSP or license reseller.",
  },
  {
    q: "What savings should clients expect?",
    a: "Typical engagements identify 10–40% recoverable spend through right-sizing, inactive user reclamation, SKU consolidation, and contract alignment.",
  },
  {
    q: "What data formats do you support?",
    a: "CSV and Excel exports from Microsoft 365 admin center, Azure cost management, Entra ID, and common SAM tools.",
  },
  {
    q: "Can clients access reports directly?",
    a: "Yes. Professional and Enterprise plans include a read-only client portal for stakeholders to review findings and approve recommendations.",
  },
  {
    q: "Is my data secure?",
    a: "All data is encrypted at rest and in transit. We never share client data with Microsoft, resellers, or third-party marketers.",
  },
  {
    q: "What about non-US clients?",
    a: "USD is our list price. Regional partners may offer localized pricing and billing — see the partner disclaimer below.",
  },
  {
    q: "Is there a low-commitment way to start?",
    a: "Yes — the one-time audit engagement ($12,500) is ideal for validating the platform on a single client before a SaaS subscription.",
  },
  {
    q: "Can we change plans later?",
    a: "Yes. Move from Starter to Professional, or into Enterprise, as your practice grows. Contact us to align commercial terms.",
  },
  {
    q: "Do we pay per seat or per module?",
    a: "No. SaaS pricing is per advisory firm with tiered client org limits — the full platform is included for your practice.",
  },
];

const comparisonRows = [
  { feature: "Client orgs", starter: "Up to 5", professional: "Unlimited", enterprise: "Unlimited" },
  { feature: "Rules engine", starter: "Core rules", professional: "Advanced rules", enterprise: "Custom rules" },
  { feature: "Executive PDF export", starter: true, professional: true, enterprise: true },
  { feature: "Client portal", starter: false, professional: true, enterprise: true },
  { feature: "Portfolio view", starter: false, professional: false, enterprise: true },
  { feature: "SSO + advanced RBAC", starter: false, professional: false, enterprise: true },
  { feature: "Dedicated success manager", starter: false, professional: false, enterprise: true },
  { feature: "Priority support", starter: false, professional: true, enterprise: true },
];

const includedEverywhere = [
  {
    title: "Vendor-neutral advisory",
    description: "Independent optimization — no license resale, no CSP lock-in.",
  },
  {
    title: "Traffic-light RAG health",
    description: "Compliance and savings signals your clients can act on before renewal.",
  },
  {
    title: "Microsoft licensing focus",
    description: "M365, Azure, EA, and CSP patterns — not a generic SAM tool.",
  },
];

export default function PricingPageClient() {
  const { addToast } = useToast();
  const [stripeConnected, setStripeConnected] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchBillingStatus()
      .then(({ status }) => {
        setStripeConnected(status?.connected ?? false);
      })
      .catch(() => {
        setStripeConnected(false);
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
        description: error ?? "Stripe is not connected — use Contact sales instead.",
        variant: "warning",
      });
    },
    [addToast],
  );

  return (
    <div className="bg-[var(--surface-canvas)]">
      <section className="border-b border-[var(--border-default)]">
        <div className="mx-auto max-w-[var(--content-max-width)] px-4 py-16 md:px-6 md:py-20 lg:px-8">
          <p className="mb-2 text-[var(--font-body-sm)] font-semibold text-[var(--brand-primary)]">
            Pricing
          </p>
          <h1
            className="max-w-3xl font-semibold tracking-[var(--tracking-tight)] text-[var(--text-primary)]"
            style={{ fontSize: "var(--font-display)" }}
          >
            Always know what your practice costs
          </h1>
          <p className="mt-4 max-w-xl text-[1.0625rem] text-[var(--text-secondary)]">
            Pay for the advisory platform you run — not per seat, not per module. Monthly USD list prices below;
            regional packaging available on request.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--content-max-width)] px-4 py-12 md:px-6 lg:px-8">
      <PricingTable
        stripeConnected={stripeConnected}
        onCheckout={handleCheckout}
        checkoutLoading={checkoutLoading}
      />

      <PricingComparisonTable rows={comparisonRows} />

      <section className="mt-16">
        <SectionHeader
          title="What every plan gets"
          description="You are not buying add-ons to run a normal licensing audit. These come with the platform."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {includedEverywhere.map((item) => (
            <Card key={item.title} className="hover:translate-y-0">
              <h3 className="text-[var(--font-h3)] font-semibold">{item.title}</h3>
              <p className="mt-2 text-[var(--font-body-sm)] text-[var(--text-secondary)]">
                {item.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <RoiCalculator />

      <PartnerDisclaimer />

      <div className="mt-16">
        <SectionHeader
          title="Common questions"
          description="Short answers for IT and finance buyers. Prefer a walkthrough? Try the demo."
        />
        <div className="mx-auto max-w-2xl space-y-4">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="border border-[var(--border-default)] bg-[var(--surface-raised)] p-4"
            >
              <summary className="cursor-pointer text-[var(--font-body-sm)] font-semibold">{item.q}</summary>
              <p className="mt-2 text-[var(--font-body-sm)] text-[var(--text-secondary)]">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
      </section>

      <MarketingCtaBand
        title="Ready to price your practice?"
        description="Start a trial for your advisory firm, or explore the demo walkthrough with seeded Contoso Ltd data."
        primaryHref="/signup"
        primaryLabel="Get started"
        secondaryHref="/demo"
        secondaryLabel="See the walkthrough"
        disclaimer="USD list prices — regional partners may offer localized pricing."
      />
    </div>
  );
}

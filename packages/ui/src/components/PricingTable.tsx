"use client";

import { useCallback, useState } from "react";
import { cn } from "../lib/cn";
import { Button } from "./Button";
import { Card } from "./Card";
import { Dialog, DialogContent } from "./Dialog";
import { TextInput } from "./TextInput";

export interface PricingTier {
  name: string;
  price: number | null;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
  plan?: "audit" | "retainer" | "enterprise";
}

export interface PricingTableProps {
  stripeConnected?: boolean;
  onCheckout?: (plan: "audit" | "retainer" | "enterprise") => Promise<void>;
  checkoutLoading?: string | null;
}

const tiers: PricingTier[] = [
  {
    name: "Starter",
    price: 299,
    period: "month",
    description: "For small consultancies getting started",
    features: [
      "Up to 5 client orgs",
      "Manual CSV/XLSX intake",
      "Core utilization rules",
      "PDF report export",
      "Email support",
    ],
    cta: "Start trial",
    plan: "retainer",
  },
  {
    name: "Professional",
    price: 799,
    period: "month",
    description: "For growing advisory teams",
    features: [
      "Unlimited client orgs",
      "Advanced rules engine",
      "Executive summary generator",
      "Client portal (read-only)",
      "Priority support",
    ],
    highlighted: true,
    cta: "Start trial",
    plan: "retainer",
  },
  {
    name: "Enterprise",
    price: null,
    period: "month",
    description: "For large firms and PE portfolios",
    features: [
      "Multi-org portfolio view",
      "Custom rules & thresholds",
      "SSO + advanced RBAC",
      "Dedicated success manager",
      "SLA & custom integrations",
    ],
    cta: "Contact sales",
    plan: "enterprise",
  },
];

export function PricingTable({
  stripeConnected = false,
  onCheckout,
  checkoutLoading = null,
}: PricingTableProps) {
  const [annual, setAnnual] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactEmail, setContactEmail] = useState("");
  const [contactSent, setContactSent] = useState(false);

  const handleCta = useCallback(
    async (tier: PricingTier) => {
      if (stripeConnected && tier.plan && tier.plan !== "enterprise" && onCheckout) {
        await onCheckout(tier.plan);
        return;
      }
      setContactOpen(true);
    },
    [stripeConnected, onCheckout],
  );

  function submitContact() {
    if (contactEmail) {
      window.location.href = `mailto:sales@vortexoptimizer.com?subject=Pricing%20inquiry&body=Email:%20${encodeURIComponent(contactEmail)}`;
      setContactSent(true);
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-center gap-3">
        <span className={cn("text-[var(--font-body-sm)]", !annual && "font-semibold")}>Monthly</span>
        <button
          type="button"
          role="switch"
          aria-checked={annual}
          onClick={() => setAnnual(!annual)}
          className={cn(
            "relative h-6 w-11 rounded-full transition-colors",
            annual ? "bg-[var(--brand-primary)]" : "bg-[var(--border-strong)]",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
              annual ? "translate-x-5" : "translate-x-0.5",
            )}
          />
        </button>
        <span className={cn("text-[var(--font-body-sm)]", annual && "font-semibold")}>
          Annual <span className="text-[var(--status-green)]">(save 20%)</span>
        </span>
      </div>

      {!stripeConnected && (
        <p className="mb-6 text-center text-[var(--font-body-sm)] text-[var(--text-secondary)]">
          Online checkout unavailable — contact us to get started.
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {tiers.map((tier) => {
          const price =
            tier.price === null
              ? "Custom"
              : annual
                ? `$${Math.round(tier.price * 0.8)}`
                : `$${tier.price}`;

          const ctaLabel =
            stripeConnected && tier.plan && tier.plan !== "enterprise"
              ? "Subscribe"
              : tier.cta;

          return (
            <Card
              key={tier.name}
              className={cn(
                tier.highlighted &&
                  "border-[var(--brand-primary)] ring-2 ring-[var(--brand-primary-subtle)]",
                "hover:translate-y-0",
              )}
            >
              <h3 className="text-[var(--font-h3)] font-semibold">{tier.name}</h3>
              <p className="mt-1 text-[var(--font-body-sm)] text-[var(--text-secondary)]">
                {tier.description}
              </p>
              <div className="my-4">
                <span className="text-3xl font-semibold tracking-[var(--tracking-tight)]">
                  {price}
                </span>
                {tier.price !== null && (
                  <span className="text-[var(--font-body-sm)] text-[var(--text-tertiary)]">
                    /{tier.period}
                  </span>
                )}
              </div>
              <ul className="mb-6 space-y-2">
                {tier.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-[var(--font-body-sm)] text-[var(--text-secondary)]"
                  >
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-primary)]" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant={tier.highlighted ? "primary" : "secondary"}
                className="w-full"
                onClick={() => handleCta(tier)}
                isLoading={checkoutLoading === tier.plan}
                disabled={Boolean(checkoutLoading)}
              >
                {ctaLabel}
              </Button>
            </Card>
          );
        })}
      </div>

      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent
          title="Contact sales"
          description="Stripe checkout is not connected. We'll reach out to discuss pricing."
          footer={
            <>
              <Button variant="ghost" onClick={() => setContactOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submitContact} disabled={!contactEmail || contactSent}>
                {contactSent ? "Opening email…" : "Send inquiry"}
              </Button>
            </>
          }
        >
          <TextInput
            label="Work email"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="you@firm.com"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

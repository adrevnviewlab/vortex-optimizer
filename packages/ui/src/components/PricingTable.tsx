"use client";

import { useCallback, useState } from "react";
import { cn } from "../lib/cn";
import { Button } from "./Button";
import { Card } from "./Card";
import { Dialog, DialogContent } from "./Dialog";
import { TextInput } from "./TextInput";
import { useToast } from "./Toast";

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
  const { addToast } = useToast();
  const [annual, setAnnual] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactEmail, setContactEmail] = useState("");
  const [contactCompany, setContactCompany] = useState("");
  const [contactSubmitting, setContactSubmitting] = useState(false);

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

  async function submitContact() {
    if (!contactEmail) return;
    setContactSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setContactSubmitting(false);
    setContactOpen(false);
    setContactEmail("");
    setContactCompany("");
    addToast({
      title: "Inquiry received",
      description: "Our team will reach out within one business day.",
      variant: "success",
    });
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

      <Card className="mb-8 border-dashed bg-[var(--brand-primary-muted)] hover:translate-y-0">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[var(--font-caption)] font-medium uppercase tracking-[var(--tracking-wide)] text-[var(--brand-primary)]">
              One-time engagement
            </p>
            <h3 className="mt-1 text-[var(--font-h3)] font-semibold">Full licensing audit</h3>
            <p className="mt-1 text-[var(--font-body-sm)] text-[var(--text-secondary)]">
              Vendor-neutral deep dive with executive report — ideal for first engagements or renewal prep.
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
            <p>
              <span className="text-3xl font-semibold tracking-[var(--tracking-tight)]">$12,500</span>
              <span className="text-[var(--font-body-sm)] text-[var(--text-tertiary)]"> USD one-time</span>
            </p>
            {stripeConnected && onCheckout ? (
              <Button
                variant="primary"
                onClick={() => onCheckout("audit")}
                isLoading={checkoutLoading === "audit"}
                disabled={Boolean(checkoutLoading)}
              >
                Purchase audit
              </Button>
            ) : (
              <Button variant="primary" onClick={() => setContactOpen(true)}>
                Contact sales
              </Button>
            )}
          </div>
        </div>
      </Card>

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
                    {" "}USD /{tier.period}
                  </span>
                )}
                {tier.price === null && (
                  <span className="text-[var(--font-body-sm)] text-[var(--text-tertiary)]">
                    {" "}· USD / regional
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

      <div className="mt-12 text-center">
        <p className="text-[var(--font-body-sm)] text-[var(--text-secondary)]">
          Need a custom package or portfolio pricing?
        </p>
        <Button variant="ghost" className="mt-2" onClick={() => setContactOpen(true)}>
          Contact sales
        </Button>
      </div>

      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent
          title="Contact sales"
          description="Tell us about your practice — we respond within one business day."
          footer={
            <>
              <Button variant="ghost" onClick={() => setContactOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submitContact} disabled={!contactEmail || contactSubmitting} isLoading={contactSubmitting}>
                Send inquiry
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <TextInput
              label="Work email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="you@firm.com"
            />
            <TextInput
              label="Company (optional)"
              value={contactCompany}
              onChange={(e) => setContactCompany(e.target.value)}
              placeholder="Your advisory firm"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

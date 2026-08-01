"use client";

import { useState } from "react";
import { BrandLogo, Button, Card, MarketingPrimaryLink, formatCurrency } from "@vorzop/ui";
import { Check, Upload, ScanSearch, FileText, TrendingDown } from "lucide-react";

const STEPS = [
  {
    id: 1,
    title: "Upload client data",
    description: "Import Contoso Ltd license CSV from Microsoft 365 admin center.",
    icon: Upload,
    highlight: "800 licenses · contoso.onmicrosoft.com",
    detail: "Vendor-neutral intake — no CSP or reseller integration required.",
  },
  {
    id: 2,
    title: "Run audit",
    description: "Rules engine scans 50+ SKUs against usage patterns and contract terms.",
    icon: ScanSearch,
    highlight: "23 issues found · 72% compliance score",
    detail: "Independent analysis across M365, Teams, Entra, and Azure SKUs.",
  },
  {
    id: 3,
    title: "Review RAG findings",
    description: "Traffic-light prioritized findings with confidence scores.",
    icon: TrendingDown,
    highlight: `${formatCurrency(84200)} savings identified · 18% spend reduction`,
    detail: "Typical engagements recover 10–40% of licensing spend.",
  },
  {
    id: 4,
    title: "Export savings report",
    description: "Generate executive PDF for client presentation.",
    icon: FileText,
    highlight: "Executive Summary ready for board review",
    detail: "Client-ready narrative — advisory report, not a license quote.",
  },
];

export default function DemoPage() {
  const [step, setStep] = useState(0);
  const current = STEPS[step]!;
  const Icon = current.icon;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--surface-canvas)]">
      <header className="border-b border-[var(--border-default)] px-6 py-4">
        <BrandLogo size="md" href="/welcome" />
      </header>

      <div className="flex flex-1 flex-col lg:flex-row">
        <div className="flex flex-[3] items-center justify-center p-8 lg:flex-[3]">
          <Card className="w-full max-w-3xl">
            <div className="flex min-h-[20rem] flex-col items-center justify-center rounded-lg bg-[var(--surface-sunken)] p-8 text-center">
              <Icon size={48} className="text-[var(--brand-primary)]" strokeWidth={1.5} />
              <p className="mt-4 text-[var(--font-h3)] font-semibold">{current.title}</p>
              <p className="mt-2 text-[var(--font-body)] text-[var(--brand-primary)]">{current.highlight}</p>
              <p className="mt-3 max-w-md text-[var(--font-body-sm)] text-[var(--text-secondary)]">
                {current.detail}
              </p>
              <div className="mt-8 w-full max-w-sm rounded-lg border border-[var(--border-default)] bg-[var(--surface-raised)] p-4 text-left">
                <p className="text-[var(--font-caption)] uppercase tracking-[var(--tracking-wide)] text-[var(--text-tertiary)]">
                  Demo client
                </p>
                <p className="font-semibold">Contoso Ltd</p>
                <p className="text-[var(--font-body-sm)] text-[var(--text-secondary)]">
                  Seeded fictional data — no real PII
                </p>
              </div>
            </div>
          </Card>
        </div>

        <aside className="flex flex-[2] flex-col border-t border-[var(--border-default)] bg-[var(--surface-raised)] p-6 lg:border-l lg:border-t-0">
          <h2 className="text-[var(--font-h2)] font-semibold">Guided walkthrough</h2>
          <p className="mt-1 text-[var(--font-body-sm)] text-[var(--text-secondary)]">
            Step {step + 1} of {STEPS.length} · Contoso Ltd demo
          </p>

          <ol className="mt-6 flex-1 space-y-4">
            {STEPS.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setStep(i)}
                  className={`flex w-full items-start gap-3 rounded-[var(--button-radius)] p-3 text-left transition-colors ${
                    i === step
                      ? "bg-[var(--brand-primary-muted)]"
                      : "hover:bg-[var(--surface-sunken)]"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[var(--font-caption)] font-semibold ${
                      i < step
                        ? "bg-[var(--status-green)] text-white"
                        : i === step
                          ? "bg-[var(--brand-primary)] text-white"
                          : "bg-[var(--surface-sunken)] text-[var(--text-tertiary)]"
                    }`}
                  >
                    {i < step ? <Check size={12} /> : s.id}
                  </span>
                  <span>
                    <span className="block text-[var(--font-body-sm)] font-medium">{s.title}</span>
                    <span className="text-[var(--font-caption)] text-[var(--text-secondary)]">
                      {s.description}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ol>

          <div className="mt-8 flex flex-wrap gap-2">
            <Button variant="secondary" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep((s) => s + 1)}>Next</Button>
            ) : (
              <MarketingPrimaryLink href="/signup">Start real trial</MarketingPrimaryLink>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

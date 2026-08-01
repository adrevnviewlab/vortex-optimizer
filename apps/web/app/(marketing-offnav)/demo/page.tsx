"use client";

import { useState } from "react";
import {
  BrandLogo,
  Button,
  Card,
  DashboardPreview,
  FlipCard,
  MarketingCtaBand,
  MarketingPrimaryLink,
  SectionHeader,
  formatCurrency,
} from "@vorzop/ui";
import { Check, Upload, ScanSearch, FileText, TrendingDown, BarChart3 } from "lucide-react";

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

const outcomeCards = [
  {
    step: "Step 01",
    title: "See the licensing pulse first",
    description:
      "Advisors open one screen and know savings identified, compliance score, open findings, and renewal timeline — before chasing three spreadsheets.",
    badge: "Outcome",
    icon: <BarChart3 size={20} className="text-[var(--brand-primary)]" />,
  },
  {
    step: "Step 02",
    title: "Run audits without data fog",
    description:
      "Tenant exports normalize into a single inventory. SKU overlap and tier sprawl stay clear through the cycle — not a merged Excel workbook.",
    badge: "Outcome",
    icon: <Upload size={20} className="text-[var(--brand-primary)]" />,
  },
  {
    step: "Step 03",
    title: "Prioritize with traffic-light RAG",
    description:
      "Findings ranked by dollar impact and confidence. Finance teams see red/amber/green signals they can act on before renewal.",
    badge: "Outcome",
    icon: <TrendingDown size={20} className="text-[var(--brand-primary)]" />,
  },
  {
    step: "Step 04",
    title: "Recover spend with visible savings queue",
    description:
      "Ranked opportunities live in the console. Right-sizing and reclamation work stops hiding in private inboxes and ad hoc reports.",
    badge: "Outcome",
    icon: <ScanSearch size={20} className="text-[var(--brand-primary)]" />,
  },
  {
    step: "Step 05",
    title: "Close the engagement with board-ready numbers",
    description:
      "Executive PDF pulls from the same ledger as the dashboard — so Monday's narrative matches Friday's client presentation.",
    badge: "Outcome",
    icon: <FileText size={20} className="text-[var(--brand-primary)]" />,
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

      <section className="mx-auto max-w-[var(--content-max-width)] px-6 py-12 text-center">
        <p className="mb-2 text-[var(--font-caption)] font-medium uppercase tracking-[var(--tracking-wide)] text-[var(--brand-primary)]">
          Demo walkthrough · no signup required
        </p>
        <h1
          className="font-semibold tracking-[var(--tracking-tight)]"
          style={{
            fontFamily: "var(--font-display-family)",
            fontSize: "var(--font-h1)",
          }}
        >
          See what advisors gain — value, not a feature dump
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-[var(--font-body)] text-[var(--text-secondary)]">
          Sample dashboard and five outcomes for Microsoft licensing optimization. Explore below, then run the
          guided walkthrough or start a real trial.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <MarketingPrimaryLink href="/signup">Get started</MarketingPrimaryLink>
          <a
            href="/pitch"
            className="inline-flex h-11 items-center rounded-[var(--button-radius)] border border-[var(--border-default)] px-6 text-[var(--font-body)] font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)]"
          >
            Use the buyer pitch
          </a>
        </div>
      </section>

      <DashboardPreview />

      <section className="mx-auto max-w-[var(--content-max-width)] px-6 py-16">
        <SectionHeader
          title="Five things that change when audits live here"
          description="Walk these with your client or ops lead — each step is an outcome, not a menu tour. Hover or tap a card for the benefit."
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {outcomeCards.map((card) => (
            <FlipCard
              key={card.title}
              title={card.title}
              description={card.description}
              icon={card.icon}
              step={card.step}
              badge={card.badge}
            />
          ))}
          <Card className="flex flex-col justify-center hover:translate-y-0">
            <p className="text-[var(--font-caption)] font-semibold text-[var(--brand-primary)]">Next</p>
            <h3 className="mt-2 text-[var(--font-h3)] font-semibold">Ready for live numbers?</h3>
            <p className="mt-2 text-[var(--font-body-sm)] text-[var(--text-secondary)]">
              Run the guided walkthrough with Contoso Ltd sample data, then stand up a tenant when you&apos;re
              ready.
            </p>
            <a
              href="#walkthrough"
              className="mt-4 text-[var(--font-body-sm)] font-medium text-[var(--brand-primary)] hover:underline"
            >
              Start guided walkthrough →
            </a>
          </Card>
        </div>
      </section>

      <div id="walkthrough" className="flex flex-1 flex-col border-t border-[var(--border-default)] lg:flex-row">
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

      <MarketingCtaBand
        title="Ready for a live walkthrough?"
        description="We cover intake, RAG findings, and savings reports with your client shape in mind — then you can stand up a tenant when you're ready."
        primaryHref="/signup"
        primaryLabel="Get started"
        secondaryHref="/pitch"
        secondaryLabel="Use the buyer pitch"
        disclaimer="Selling to a committee? Use the buyer pitch · Independent advisory — not license resale."
      />
    </div>
  );
}

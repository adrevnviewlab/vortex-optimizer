"use client";

import { useState } from "react";
import { BrandLogo, Button, Card, formatCurrency } from "@vorzop/ui";
import { Check, Upload, ScanSearch, FileText, TrendingDown } from "lucide-react";

const STEPS = [
  {
    id: 1,
    title: "Upload client data",
    description: "Import Contoso Ltd license CSV from Microsoft 365 admin center.",
    icon: Upload,
    highlight: "800 licenses · contoso.onmicrosoft.com",
  },
  {
    id: 2,
    title: "Run audit",
    description: "Rules engine scans 50 SKUs against usage patterns and contract terms.",
    icon: ScanSearch,
    highlight: "23 issues found · 72% compliance",
  },
  {
    id: 3,
    title: "Review RAG findings",
    description: "Traffic-light prioritized findings with confidence scores.",
    icon: TrendingDown,
    highlight: `${formatCurrency(84200)} savings identified`,
  },
  {
    id: 4,
    title: "Export savings report",
    description: "Generate executive PDF for client presentation.",
    icon: FileText,
    highlight: "Executive Summary ready",
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
        <div className="flex flex-1 items-center justify-center p-8">
          <Card className="w-full max-w-2xl">
            <div className="flex h-64 flex-col items-center justify-center rounded-lg bg-[var(--surface-sunken)] p-6 text-center">
              <Icon size={48} className="text-[var(--brand-primary)]" strokeWidth={1.5} />
              <p className="mt-4 text-[var(--font-h3)] font-semibold">{current.title}</p>
              <p className="mt-2 text-[var(--font-body-sm)] text-[var(--text-secondary)]">
                {current.highlight}
              </p>
              <div className="mt-6 w-full max-w-sm rounded-lg border border-[var(--border-default)] bg-[var(--surface-raised)] p-4 text-left">
                <p className="text-[var(--font-caption)] uppercase text-[var(--text-tertiary)]">
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

        <aside className="w-full border-t border-[var(--border-default)] bg-[var(--surface-raised)] p-6 lg:w-[400px] lg:border-l lg:border-t-0">
          <h2 className="text-[var(--font-h2)] font-semibold">Guided walkthrough</h2>
          <p className="mt-1 text-[var(--font-body-sm)] text-[var(--text-secondary)]">
            Step {step + 1} of {STEPS.length}
          </p>

          <ol className="mt-6 space-y-4">
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

          <div className="mt-8 flex gap-2">
            <Button
              variant="secondary"
              disabled={step === 0}
              onClick={() => setStep((s) => s - 1)}
            >
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep((s) => s + 1)}>Next</Button>
            ) : (
              <a href="/signup">
                <Button>Start real trial</Button>
              </a>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

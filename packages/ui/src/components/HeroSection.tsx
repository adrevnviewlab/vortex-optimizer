"use client";

import { BrandLogo } from "./BrandLogo";

export interface HeroSectionProps {
  headline?: string;
  subline?: string;
  visual?: React.ReactNode;
}

export function HeroSection({
  headline = "Optimize Microsoft licensing. Recover spend.",
  subline = "Independent consultancy platform for M365, Azure, and EA optimization — with executive narrative and savings projections built in.",
  visual,
}: HeroSectionProps) {
  return (
    <section className="mx-auto grid max-w-[var(--content-max-width)] items-center gap-12 px-4 py-16 md:grid-cols-[45%_55%] md:px-6 md:py-24">
      <div>
        <div className="mb-6">
          <BrandLogo size="lg" href="/welcome" />
        </div>
        <h1
          className="font-semibold leading-[var(--leading-tight)] tracking-[var(--tracking-tight)]"
          style={{
            fontFamily: "var(--font-display-family, 'Instrument Sans', sans-serif)",
            fontSize: "var(--font-display)",
          }}
        >
          {headline}
        </h1>
        <p className="mt-4 max-w-lg text-[var(--font-body)] leading-[var(--leading-relaxed)] text-[var(--text-secondary)]">
          {subline}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="/signup"
            className="inline-flex h-11 items-center rounded-[var(--button-radius)] bg-[var(--brand-primary)] px-6 text-[var(--font-body)] font-medium text-[var(--text-inverse)] hover:bg-[var(--brand-primary-hover)]"
          >
            Start free audit
          </a>
          <a
            href="/features"
            className="inline-flex h-11 items-center rounded-[var(--button-radius)] px-6 text-[var(--font-body)] font-medium text-[var(--text-secondary)] hover:bg-[var(--brand-primary-muted)] hover:text-[var(--brand-primary)]"
          >
            See features
          </a>
        </div>
      </div>
      <div className="flex items-center justify-center">
        {visual ?? <DashboardMockVisual />}
      </div>
    </section>
  );
}

function DashboardMockVisual() {
  return (
    <div
      className="w-full max-w-md rounded-[var(--card-radius)] border border-[var(--border-default)] bg-[var(--surface-raised)] p-4 shadow-[var(--shadow-lg)]"
      aria-hidden
    >
      <div className="mb-4 flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 flex-1 rounded-lg bg-[var(--surface-sunken)]" />
        ))}
      </div>
      <div className="mb-4 h-32 rounded-lg bg-[var(--brand-primary-muted)]" />
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 rounded bg-[var(--surface-sunken)]" />
        ))}
      </div>
    </div>
  );
}

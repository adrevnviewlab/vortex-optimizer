"use client";

import { useCallback, useEffect, useState } from "react";
import { BrandLogo, MarketingPrimaryLink, formatCurrency } from "@vorzop/ui";

const SLIDES = [
  {
    title: "Vortex Optimizer",
    subtitle: "Optimize Microsoft licensing. Recover spend.",
    body: "The independent consultancy platform for M365, Azure, and EA optimization — vendor-neutral advisory, not license resale.",
    accent: true,
  },
  {
    title: "Buyers who run licensing audits",
    subtitle: "IT leaders · finance · PE portfolios",
    body: "Mid-market IT teams billing M365 renewals, finance leaders chasing spend visibility, and PE-backed portfolios managing Microsoft spend across holdings.",
    bullets: [
      "IT directors preparing EA or CSP renewals",
      "Finance leaders evaluating IT spend before board review",
      "PE portfolio ops managing Microsoft across holdings",
    ],
  },
  {
    title: "The problem",
    subtitle: "10–40% of M365 spend is recoverable",
    body: "Inactive users, SKU overlap, premium tier sprawl, and misaligned EA true-ups cost enterprises millions annually. Spreadsheet audits can't keep pace with tenant complexity.",
    bullets: [
      "Invoice cycles live in Excel, findings scatter across email",
      "Aging inactive licenses reconstructed late each renewal",
      "Nobody sees who has what until procurement asks",
    ],
  },
  {
    title: "Spreadsheet ops still run the audit",
    subtitle: "Pain points advisors inherit",
    body: "Independent consultants inherit clients whose licensing truth lives in five exports and a shared drive folder. The pain shows up as late findings, renewal surprises, and board packs that take a weekend.",
    bullets: [
      "SKU normalization done manually every engagement",
      "No confidence scores — just gut feel on savings",
      "Executive narrative rebuilt from scratch each time",
    ],
  },
  {
    title: "One platform for the licensing day",
    subtitle: "Problem → solution → product",
    body: "Give advisors, finance, and client stakeholders the same operational picture — scoped per client org. Savings stay ranked by confidence. RAG health replaces end-of-quarter surprises.",
    bullets: [
      "01 Scope everything to one client org per audit",
      "02 Keep SKU inventory clear by design",
      "03 Connect findings to executive narrative",
      "04 Surface savings before renewal escalates",
    ],
  },
  {
    title: "The solution",
    subtitle: "Upload → Analyze → Report",
    body: "Import tenant data, run 50+ optimization patterns, and deliver client-ready savings narratives in hours — as an independent advisor your clients trust.",
    bullets: [
      "Vendor-neutral intake — no CSP integration",
      "Traffic-light RAG for compliance and overspend",
      "Board-ready PDF from the same data as the dashboard",
    ],
  },
  {
    title: "ROI case study",
    subtitle: "Contoso Ltd — $84,200 identified",
    body: `Annual savings of ${formatCurrency(84200)} from 23 critical findings. 18% reduction in licensing spend with 92% confidence on top recommendations. No license resale — pure advisory.`,
  },
  {
    title: "Product pillars",
    subtitle: "Vortex Optimizer — licensing advisory console",
    body: "A focused console for independent Microsoft licensing advisors. Not a marketplace. Not a CSP portal. The software your team opens when they start an audit.",
    bullets: [
      "One client org — tenant isolation per engagement",
      "Audit workflows — intake, rules, RAG, reports",
      "Client portal — stakeholders review and approve",
    ],
  },
  {
    title: "Pricing",
    subtitle: "Simple, transparent USD pricing",
    body: "Starter $299/mo · Professional $799/mo · Enterprise custom · One-time audit $12,500. Regional partners may offer localized pricing.",
  },
  {
    title: "Get started",
    subtitle: "Start your first audit today",
    body: "Independent Microsoft licensing optimization — recover spend without changing your CSP relationship.",
    cta: true,
  },
];

export default function PitchPage() {
  const [index, setIndex] = useState(0);

  const go = useCallback((next: number) => {
    setIndex(Math.max(0, Math.min(SLIDES.length - 1, next)));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        go(index + 1);
      }
      if (e.key === "ArrowLeft") go(index - 1);
      if (e.key === "Escape") window.location.href = "/welcome";
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, go]);

  const slide = SLIDES[index]!;

  return (
    <div className="relative flex min-h-screen flex-col bg-[var(--surface-canvas)]">
      <header className="absolute left-6 top-6 z-10">
        <BrandLogo size="sm" href="/welcome" />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        {slide.accent && <BrandLogo size="lg" className="mb-8" showWordmark={false} />}
        <p className="mb-2 text-[var(--font-caption)] font-medium uppercase tracking-[var(--tracking-wide)] text-[var(--brand-primary)]">
          Buyer pitch · Microsoft licensing
        </p>
        <h1
          className="max-w-3xl font-semibold tracking-[var(--tracking-tight)] text-[var(--text-primary)]"
          style={{
            fontFamily: "var(--font-display-family)",
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
          }}
        >
          {slide.title}
        </h1>
        <p className="mt-4 text-xl text-[var(--brand-primary)]">{slide.subtitle}</p>
        <p className="mt-6 max-w-2xl text-[var(--font-body-lg,1rem)] leading-[var(--leading-relaxed)] text-[var(--text-secondary)]">
          {slide.body}
        </p>
        {"bullets" in slide && slide.bullets && (
          <ul className="mt-6 max-w-xl space-y-2 text-left">
            {slide.bullets.map((bullet) => (
              <li
                key={bullet}
                className="flex items-start gap-2 text-[var(--font-body-sm)] text-[var(--text-secondary)]"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-primary)]" />
                {bullet}
              </li>
            ))}
          </ul>
        )}
        {slide.cta && (
          <div className="mt-8 flex flex-col items-center gap-4">
            <MarketingPrimaryLink href="/signup">Get Started</MarketingPrimaryLink>
            <p className="text-[var(--font-caption)] text-[var(--text-tertiary)]">
              Or visit{" "}
              <a href="/demo" className="text-[var(--brand-primary)] hover:underline">
                /demo
              </a>{" "}
              for a guided walkthrough
            </p>
          </div>
        )}
      </main>

      <footer className="flex items-center justify-center gap-4 pb-12">
        <button
          type="button"
          onClick={() => go(index - 1)}
          disabled={index === 0}
          className="rounded-[var(--button-radius)] px-3 py-2 text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)] disabled:opacity-30"
          aria-label="Previous slide"
        >
          ←
        </button>
        <div className="flex gap-2" role="tablist" aria-label="Slides">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Slide ${i + 1}`}
              onClick={() => go(i)}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === index ? "bg-[var(--brand-primary)]" : "bg-[var(--border-strong)]"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => go(index + 1)}
          disabled={index === SLIDES.length - 1}
          className="rounded-[var(--button-radius)] px-3 py-2 text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)] disabled:opacity-30"
          aria-label="Next slide"
        >
          →
        </button>
      </footer>
    </div>
  );
}

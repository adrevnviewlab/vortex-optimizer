"use client";

import { useCallback, useEffect, useState } from "react";
import { BrandLogo, formatCurrency } from "@vorzop/ui";

const SLIDES = [
  {
    title: "Vortex Optimizer",
    subtitle: "Optimize Microsoft licensing. Recover spend.",
    body: "The consultancy platform for M365 license optimization.",
    accent: true,
  },
  {
    title: "The problem",
    subtitle: "30–40% of M365 spend is wasted",
    body: "Inactive users, SKU overlap, and premium tier sprawl cost enterprises millions annually. Manual spreadsheet audits can't keep pace.",
  },
  {
    title: "The solution",
    subtitle: "Upload → Analyze → Report",
    body: "Import tenant data, run our rules engine against 50+ optimization patterns, and deliver client-ready savings reports in hours—not weeks.",
  },
  {
    title: "ROI case study",
    subtitle: "Contoso Ltd — $84,200 identified",
    body: `Annual savings of ${formatCurrency(84200)} from 23 critical findings. 18% reduction in licensing spend with 92% confidence on top recommendations.`,
  },
  {
    title: "Pricing",
    subtitle: "Simple, transparent USD pricing",
    body: "Starter $299/mo · Professional $799/mo · Enterprise custom. Regional partners may offer localized pricing.",
  },
  {
    title: "Get started",
    subtitle: "Start your first audit today",
    body: "Contact sales@vortex.example · Scan QR for demo access",
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
      if (e.key === "ArrowRight") go(index + 1);
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
        {slide.accent && (
          <BrandLogo size="lg" className="mb-8" showWordmark={false} />
        )}
        <h1
          className="max-w-3xl font-semibold tracking-[var(--tracking-tight)] text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-display-family)", fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
        >
          {slide.title}
        </h1>
        <p className="mt-4 text-xl text-[var(--brand-primary)]">{slide.subtitle}</p>
        <p className="mt-6 max-w-2xl text-[var(--font-body-lg)] text-[var(--text-secondary)]">
          {slide.body}
        </p>
        {slide.cta && (
          <a
            href="/signup"
            className="mt-8 inline-flex h-11 items-center rounded-[var(--button-radius)] bg-[var(--brand-primary)] px-6 text-[var(--font-body-sm)] font-medium text-white hover:bg-[var(--brand-primary-hover)]"
          >
            Start free audit
          </a>
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

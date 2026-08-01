"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BrandLogo } from "./BrandLogo";
import { MarketingPrimaryLink } from "./MarketingPrimaryLink";
import { springConfig } from "../lib/cn";

export interface HeroSectionProps {
  headline?: string;
  subline?: string;
}

export function HeroSection({
  headline = "Optimize Microsoft licensing. Recover spend.",
  subline = "Independent advisory platform for Microsoft 365, Azure, and EA — uncover 10–40% savings without reselling licenses.",
}: HeroSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-[var(--content-max-width)] flex-col justify-center px-4 py-16 md:px-6 md:py-24">
      <div className="max-w-2xl">
        <div className="mb-8">
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
        <p className="mt-4 max-w-xl text-[var(--font-body-lg,1rem)] leading-[var(--leading-relaxed)] text-[var(--text-secondary)]">
          {subline}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <MarketingPrimaryLink href="/signup">Get Started</MarketingPrimaryLink>
          <motion.a
            href="/features"
            whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
            transition={springConfig}
            className="inline-flex h-11 items-center rounded-[var(--button-radius)] px-6 text-[var(--font-body)] font-medium text-[var(--text-secondary)] hover:bg-[var(--brand-primary-muted)] hover:text-[var(--brand-primary)]"
          >
            See features
          </motion.a>
        </div>
      </div>
    </section>
  );
}

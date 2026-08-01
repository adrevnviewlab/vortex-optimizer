"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BrandLogo } from "./BrandLogo";
import { MarketingPrimaryLink } from "./MarketingPrimaryLink";
import { springConfig } from "../lib/cn";

export interface HeroSectionProps {
  headline?: string;
  subline?: string;
  tags?: string[];
  showDemoLinks?: boolean;
}

export function HeroSection({
  headline = "Optimize Microsoft licensing. Recover spend.",
  subline = "Independent advisory platform for Microsoft 365, Azure, and EA — uncover 10–40% savings without reselling licenses.",
  tags = ["M365 · Azure · EA", "Vendor-neutral advisory", "10–40% typical recovery"],
  showDemoLinks = true,
}: HeroSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-[var(--content-max-width)] flex-col justify-center px-4 py-16 md:px-6 md:py-24">
      <div className="max-w-2xl">
        <div className="mb-8">
          <BrandLogo size="lg" href="/welcome" />
        </div>
        <h1
          className="font-light leading-[var(--leading-tight)] tracking-[var(--tracking-tight)] text-[var(--text-primary)]"
          style={{ fontSize: "var(--font-display)" }}
        >
          {headline}
        </h1>
        <p className="mt-4 max-w-xl text-[var(--font-body)] leading-[var(--leading-relaxed)] text-[var(--text-secondary)]">
          {subline}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <MarketingPrimaryLink href="/signup">Get started</MarketingPrimaryLink>
          <motion.a
            href="/demo"
            whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
            transition={springConfig}
            className="inline-flex h-11 items-center rounded-[var(--button-radius)] border border-[var(--brand-primary)] px-6 text-[var(--font-body-sm)] font-medium text-[var(--brand-primary)] hover:bg-[var(--brand-primary-subtle)]"
          >
            Continue as demo
          </motion.a>
          <motion.a
            href="/demo"
            whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
            transition={springConfig}
            className="inline-flex h-11 items-center rounded-[var(--button-radius)] border border-[var(--border-default)] px-6 text-[var(--font-body-sm)] font-medium text-[var(--text-primary)] hover:bg-[var(--surface-sunken)]"
          >
            Request a demo
          </motion.a>
        </div>
        {showDemoLinks && (
          <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[var(--font-body-sm)]">
            <a href="/demo" className="text-[var(--brand-primary)] hover:underline">
              See the walkthrough
            </a>
            <a href="/pitch" className="text-[var(--brand-primary)] hover:underline">
              See the buyer pitch
            </a>
          </p>
        )}
        {tags.length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-1 text-[var(--font-body-sm)] text-[var(--text-tertiary)]">
            {tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

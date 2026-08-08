"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BrandLogo } from "./BrandLogo";
import { MarketingPrimaryLink } from "./MarketingPrimaryLink";
import { springConfig } from "../lib/cn";

export interface HeroSectionProps {
  headline?: string;
  subline?: string;
  /** @deprecated Tags clutter the first viewport — ignored when empty (default). */
  tags?: string[];
  showDemoLinks?: boolean;
}

/**
 * microsoft.com–style light hero: brand, large headline, supporting line, dual CTAs.
 * DashboardPreview lives below the fold on the welcome page.
 */
export function HeroSection({
  headline = "Optimize Microsoft licensing. Recover spend.",
  subline = "Independent advisory for Microsoft 365, Azure, and EA — uncover 10–40% savings without reselling licenses.",
  tags = [],
  showDemoLinks = false,
}: HeroSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden bg-[var(--surface-canvas)]">
      {/* Soft Fluent atmosphere — not a flat white slab */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 100% 0%, rgba(0, 103, 184, 0.12) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 0% 100%, rgba(0, 164, 239, 0.08) 0%, transparent 50%), linear-gradient(180deg, #f5f9fc 0%, #ffffff 45%, #ffffff 100%)",
        }}
      />

      <div className="mx-auto max-w-[var(--content-max-width)] px-4 py-16 md:px-6 md:py-24 lg:px-8 lg:py-28">
        <div className="max-w-3xl">
          <motion.div
            className="mb-8"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springConfig}
          >
            <BrandLogo size="lg" href="/welcome" />
          </motion.div>

          <motion.h1
            className="font-semibold leading-[var(--leading-tight)] tracking-[var(--tracking-tight)] text-[var(--text-primary)]"
            style={{ fontSize: "var(--font-display)" }}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springConfig, delay: 0.05 }}
          >
            {headline}
          </motion.h1>

          <motion.p
            className="mt-5 max-w-xl text-[1.0625rem] leading-[var(--leading-relaxed)] text-[var(--text-secondary)]"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springConfig, delay: 0.1 }}
          >
            {subline}
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap gap-3"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springConfig, delay: 0.15 }}
          >
            <MarketingPrimaryLink href="/demo/launch">Try the demo</MarketingPrimaryLink>
            <motion.a
              href="/features"
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              transition={springConfig}
              className="inline-flex min-h-11 items-center border border-[var(--brand-primary)] px-6 py-2.5 text-[var(--font-body-sm)] font-semibold text-[var(--text-primary)] hover:bg-[var(--brand-primary-muted)]"
            >
              See features
            </motion.a>
            <motion.a
              href="/signup"
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              transition={springConfig}
              className="inline-flex min-h-11 items-center px-4 py-2.5 text-[var(--font-body-sm)] font-semibold text-[var(--brand-primary)] hover:underline"
            >
              Get started
            </motion.a>
          </motion.div>

          {showDemoLinks && (
            <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[var(--font-body-sm)]">
              <a
                href="/demo/launch"
                className="text-[var(--brand-primary)] underline-offset-2 hover:underline"
              >
                Explore live demo
              </a>
              <a
                href="/demo"
                className="text-[var(--brand-primary)] underline-offset-2 hover:underline"
              >
                See the walkthrough
              </a>
              <a
                href="/pitch"
                className="text-[var(--brand-primary)] underline-offset-2 hover:underline"
              >
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
      </div>
    </section>
  );
}

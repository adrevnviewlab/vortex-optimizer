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

/** Sparse hero: brand + headline + one line + CTA + one visual. No cards/stats. */
export function HeroSection({
  headline = "Optimize Microsoft licensing. Recover spend.",
  subline = "Independent advisory for Microsoft 365, Azure, and EA — uncover 10–40% savings without reselling licenses.",
  tags = [],
  showDemoLinks = false,
}: HeroSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative mx-auto flex min-h-[calc(100vh-var(--header-height))] max-w-[var(--content-max-width)] flex-col justify-center overflow-hidden px-4 py-16 md:px-6 md:py-20">
      {/* Atmosphere — soft radial wash, not a card grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 85% 40%, var(--brand-primary-subtle) 0%, transparent 65%), radial-gradient(ellipse 50% 40% at 10% 80%, rgba(90, 200, 250, 0.12) 0%, transparent 60%)",
        }}
      />

      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-16">
        <div className="max-w-xl">
          <motion.div
            className="mb-8"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springConfig}
          >
            <BrandLogo size="lg" href="/welcome" />
          </motion.div>
          <motion.h1
            className="font-light leading-[var(--leading-tight)] tracking-[var(--tracking-tight)] text-[var(--text-primary)]"
            style={{ fontSize: "var(--font-display)" }}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springConfig, delay: 0.05 }}
          >
            {headline}
          </motion.h1>
          <motion.p
            className="mt-4 max-w-lg text-[var(--font-body)] leading-[var(--leading-relaxed)] text-[var(--text-secondary)]"
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
            <MarketingPrimaryLink href="/signup">Get started</MarketingPrimaryLink>
            <motion.a
              href="/demo"
              whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
              transition={springConfig}
              className="inline-flex h-11 items-center rounded-[var(--button-radius)] border border-[var(--border-default)] px-6 text-[var(--font-body-sm)] font-medium text-[var(--text-primary)] hover:bg-[var(--surface-sunken)]"
            >
              Request a demo
            </motion.a>
          </motion.div>
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

        {/* Single dominant visual — product atmosphere, not stats/cards */}
        <motion.div
          className="relative mx-auto hidden w-full max-w-md lg:block"
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...springConfig, delay: 0.12 }}
          aria-hidden
        >
          <div
            className="aspect-[4/5] w-full overflow-hidden rounded-[24px]"
            style={{
              background:
                "linear-gradient(160deg, #007aff 0%, #5ac8fa 42%, #e8f1ff 100%)",
            }}
          >
            <div className="flex h-full flex-col justify-between p-8 text-white">
              <div>
                <p className="text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-white/70">
                  Licensing advisory
                </p>
                <p className="mt-3 text-2xl font-light leading-tight tracking-tight">
                  Recover spend before the renewal call.
                </p>
              </div>
              <div className="space-y-3">
                <div className="h-1.5 w-3/4 rounded-full bg-white/30" />
                <div className="h-1.5 w-1/2 rounded-full bg-white/20" />
                <div className="mt-6 flex h-[4.5rem] items-end gap-2">
                  {[40, 65, 48, 80, 55, 90].map((h, i) => (
                    <motion.div
                      key={i}
                      className="origin-bottom flex-1 rounded-t-sm bg-white/50"
                      style={{ height: `${h}%` }}
                      initial={shouldReduceMotion ? false : { scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ ...springConfig, delay: 0.25 + i * 0.04 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

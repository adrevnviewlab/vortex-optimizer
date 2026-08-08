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
 * microsoft.com–style full-bleed hero: dominant visual plane, large headline,
 * one supporting line, dual CTAs. Vortex branding only — no MS trademarks.
 */
export function HeroSection({
  headline = "Optimize Microsoft licensing. Recover spend.",
  subline = "Independent advisory for Microsoft 365, Azure, and EA — uncover 10–40% savings without reselling licenses.",
  tags = [],
  showDemoLinks = false,
}: HeroSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative isolate min-h-[min(88vh,720px)] overflow-hidden bg-[var(--surface-hero)] text-[var(--text-inverse)]">
      {/* Full-bleed visual plane — Fluent blues, not purple AI gradients */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(115deg, #00188f 0%, #0067B8 42%, #00a4ef 78%, #7fba00 120%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 85% 20%, rgba(255,255,255,0.18) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 10% 90%, rgba(0,0,0,0.25) 0%, transparent 60%)",
        }}
      />

      <div className="mx-auto flex min-h-[min(88vh,720px)] max-w-[var(--content-max-width)] flex-col justify-center px-4 py-16 md:px-6 md:py-24 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
          <div className="max-w-2xl">
            <motion.div
              className="mb-8 [&_span]:text-white [&_path]:stroke-white [&_circle]:fill-white"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={springConfig}
            >
              <BrandLogo size="lg" href="/welcome" />
            </motion.div>
            <motion.h1
              className="font-semibold leading-[var(--leading-tight)] tracking-[var(--tracking-tight)] text-white"
              style={{ fontSize: "var(--font-display)" }}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springConfig, delay: 0.05 }}
            >
              {headline}
            </motion.h1>
            <motion.p
              className="mt-4 max-w-lg text-[1.0625rem] leading-[var(--leading-relaxed)] text-white/90"
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
              <MarketingPrimaryLink
                href="/signup"
                className="bg-white text-[var(--text-primary)] hover:bg-[var(--surface-sunken)]"
              >
                Get started
              </MarketingPrimaryLink>
              <motion.a
                href="/demo"
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                transition={springConfig}
                className="inline-flex h-11 items-center border border-white px-6 text-[var(--font-body-sm)] font-semibold text-white hover:bg-white/10"
              >
                See the walkthrough
              </motion.a>
            </motion.div>
            {showDemoLinks && (
              <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[var(--font-body-sm)]">
                <a href="/demo" className="text-white underline-offset-2 hover:underline">
                  See the walkthrough
                </a>
                <a href="/pitch" className="text-white underline-offset-2 hover:underline">
                  See the buyer pitch
                </a>
              </p>
            )}
            {tags.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-1 text-[var(--font-body-sm)] text-white/70">
                {tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            )}
          </div>

          <motion.div
            className="relative mx-auto hidden w-full max-w-lg lg:block"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springConfig, delay: 0.12 }}
            aria-hidden
          >
            <div className="aspect-[16/11] w-full overflow-hidden border border-white/20 bg-black/20 backdrop-blur-[2px]">
              <div className="flex h-full flex-col justify-between p-8">
                <div>
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-white/70">
                    Licensing advisory
                  </p>
                  <p className="mt-3 text-2xl font-semibold leading-tight tracking-tight text-white">
                    Recover spend before the renewal call.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="h-1 w-3/4 bg-white/40" />
                  <div className="h-1 w-1/2 bg-white/25" />
                  <div className="mt-6 flex h-[4.5rem] items-end gap-2">
                    {[40, 65, 48, 80, 55, 90].map((h, i) => (
                      <motion.div
                        key={i}
                        className="origin-bottom flex-1 bg-white/55"
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
      </div>
    </section>
  );
}

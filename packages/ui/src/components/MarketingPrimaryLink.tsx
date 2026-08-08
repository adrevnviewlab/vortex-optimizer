"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn, springConfig } from "../lib/cn";

export interface MarketingPrimaryLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

/** Fluent-like rectangular primary CTA (filled) — white text on brand blue. */
export function MarketingPrimaryLink({ href, children, className }: MarketingPrimaryLinkProps) {
  const [tracing, setTracing] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleClick = () => {
    setTracing(true);
    setTimeout(() => setTracing(false), shouldReduceMotion ? 150 : 600);
  };

  return (
    <motion.a
      href={href}
      onClick={handleClick}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
      transition={springConfig}
      className={cn(
        "vo-primary-cta spring-action-rainbow inline-flex min-h-11 items-center justify-center rounded-[var(--button-radius)]",
        "bg-[var(--brand-primary)] px-6 py-2.5 text-[var(--font-body-sm)] font-semibold text-white",
        "hover:bg-[var(--brand-primary-hover)] hover:text-white transition-colors",
        tracing && "is-tracing",
        className,
      )}
    >
      {children}
    </motion.a>
  );
}

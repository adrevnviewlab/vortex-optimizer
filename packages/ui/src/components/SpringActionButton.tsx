"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn, springConfig } from "../lib/cn";

export interface SpringActionButtonProps {
  label?: string;
  onClick?: () => void;
  className?: string;
  iconOnly?: boolean;
}

export function SpringActionButton({
  label = "New",
  onClick,
  className,
  iconOnly = false,
}: SpringActionButtonProps) {
  const [tracing, setTracing] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleClick = () => {
    if (!shouldReduceMotion) {
      setTracing(true);
      setTimeout(() => setTracing(false), 600);
    }
    onClick?.();
  };

  return (
    <motion.button
      type="button"
      whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
      transition={springConfig}
      onClick={handleClick}
      className={cn(
        "vo-primary-cta spring-action-rainbow inline-flex items-center justify-center gap-2",
        "rounded-[var(--button-radius)] bg-[var(--brand-primary)] font-semibold text-white",
        "hover:bg-[var(--brand-primary-hover)] hover:text-white transition-colors",
        iconOnly ? "min-h-10 w-10" : "min-h-10 px-5 py-2",
        tracing && "is-tracing",
        className
      )}
    >
      <Plus size={18} />
      {!iconOnly && <span className="text-[var(--font-body-sm)]">{label}</span>}
    </motion.button>
  );
}

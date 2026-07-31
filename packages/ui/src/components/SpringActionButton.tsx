"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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

  const handleClick = () => {
    setTracing(true);
    setTimeout(() => setTracing(false), 600);
    onClick?.();
  };

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      transition={springConfig}
      onClick={handleClick}
      className={cn(
        "spring-action-rainbow inline-flex items-center justify-center gap-2",
        "rounded-[var(--button-radius)] bg-[var(--brand-primary)] font-medium text-[var(--text-inverse)]",
        "hover:bg-[var(--brand-primary-hover)] transition-colors",
        iconOnly ? "h-9 w-9" : "h-9 px-4",
        tracing && "is-tracing",
        className
      )}
    >
      <Plus size={18} />
      {!iconOnly && <span className="text-[var(--font-body-sm)]">{label}</span>}
    </motion.button>
  );
}

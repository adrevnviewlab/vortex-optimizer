"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../lib/cn";
import { Card } from "./Card";

export interface FlipCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  step?: string;
  badge?: string;
}

export function FlipCard({ title, description, icon, step, badge }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div
        className="h-48 cursor-pointer md:h-52"
        onClick={() => setFlipped((f) => !f)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setFlipped((f) => !f);
          }
        }}
        role="button"
        tabIndex={0}
        aria-pressed={flipped}
      >
        <Card className="flex h-full flex-col items-center justify-center text-center hover:translate-y-0">
          {!flipped ? (
            <>
              {icon && (
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--brand-primary-subtle)]">
                  {icon}
                </div>
              )}
              {step && (
                <p className="mb-2 text-[var(--font-caption)] font-semibold text-[var(--brand-primary)]">
                  {step}
                </p>
              )}
              <h3 className="text-[var(--font-h3)] font-semibold">{title}</h3>
            </>
          ) : (
            <>
              {badge && (
                <p className="mb-2 text-[var(--font-caption)] font-medium uppercase tracking-[var(--tracking-wide)] text-[var(--text-tertiary)]">
                  {badge}
                </p>
              )}
              <p className="px-4 text-[var(--font-body-sm)] text-[var(--text-secondary)]">{description}</p>
            </>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div
      className="h-48 cursor-pointer [perspective:1000px] md:h-52"
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      onClick={() => setFlipped((f) => !f)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setFlipped((f) => !f);
        }
      }}
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative h-full w-full [transform-style:preserve-3d]"
        style={{ transformStyle: "preserve-3d" }}
      >
        <Card
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center text-center [backface-visibility:hidden]",
            "hover:translate-y-0 hover:shadow-[var(--shadow-sm)]",
          )}
        >
          {icon && (
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--brand-primary-subtle)]">
              {icon}
            </div>
          )}
          {step && (
            <p className="mb-2 text-[var(--font-caption)] font-semibold text-[var(--brand-primary)]">
              {step}
            </p>
          )}
          <h3 className="text-[var(--font-h3)] font-semibold">{title}</h3>
        </Card>
        <Card
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center p-6 text-center [backface-visibility:hidden]",
            "hover:translate-y-0 hover:shadow-[var(--shadow-sm)]",
          )}
          style={{ transform: "rotateY(180deg)" }}
        >
          {badge && (
            <p className="mb-2 text-[var(--font-caption)] font-medium uppercase tracking-[var(--tracking-wide)] text-[var(--text-tertiary)]">
              {badge}
            </p>
          )}
          <p className="text-[var(--font-body-sm)] text-[var(--text-secondary)]">{description}</p>
        </Card>
      </motion.div>
    </div>
  );
}

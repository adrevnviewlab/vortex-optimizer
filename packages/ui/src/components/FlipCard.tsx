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
  href?: string;
  hrefLabel?: string;
}

/** Product-style card with optional flip detail — microsoft.com card grid feel. */
export function FlipCard({
  title,
  description,
  icon,
  step,
  badge,
  href,
  hrefLabel = "Learn more",
}: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [flicker, setFlicker] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const triggerFlicker = () => {
    if (shouldReduceMotion) return;
    setFlicker(true);
    setTimeout(() => setFlicker(false), 500);
  };

  const front = (
    <>
      {icon && (
        <div className="mb-4 flex h-10 w-10 items-center justify-center bg-[var(--brand-primary-subtle)]">
          {icon}
        </div>
      )}
      {step && (
        <p className="mb-2 text-[var(--font-caption)] font-semibold text-[var(--brand-primary)]">
          {step}
        </p>
      )}
      <h3 className="text-[var(--font-h3)] font-semibold text-[var(--text-primary)]">{title}</h3>
      {!shouldReduceMotion && (
        <p className="mt-3 line-clamp-2 text-left text-[var(--font-body-sm)] text-[var(--text-secondary)]">
          {description}
        </p>
      )}
      <p className="mt-4 text-left text-[var(--font-body-sm)] font-semibold text-[var(--brand-primary)]">
        {href ? (
          <a href={href} className="hover:underline" onClick={(e) => e.stopPropagation()}>
            {hrefLabel} →
          </a>
        ) : (
          <span className="text-[var(--text-tertiary)]">Hover for details →</span>
        )}
      </p>
    </>
  );

  if (shouldReduceMotion) {
    return (
      <div
        className="min-h-52 cursor-pointer"
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
        <Card className="flex h-full flex-col items-start justify-start p-6 text-left" hoverLift={false} padding={false}>
          <div className="p-6">
            {!flipped ? (
              front
            ) : (
              <>
                {badge && (
                  <p className="mb-2 text-[var(--font-caption)] font-semibold text-[var(--text-tertiary)]">
                    {badge}
                  </p>
                )}
                <p className="text-[var(--font-body-sm)] text-[var(--text-secondary)]">{description}</p>
              </>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flip-card-shell min-h-52 cursor-pointer [perspective:1000px]",
        flicker && "is-flickering",
      )}
      onMouseEnter={() => {
        setFlipped(true);
        triggerFlicker();
      }}
      onMouseLeave={() => setFlipped(false)}
      onClick={() => {
        setFlipped((f) => !f);
        triggerFlicker();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setFlipped((f) => !f);
          triggerFlicker();
        }
      }}
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative h-full min-h-52 w-full [transform-style:preserve-3d]"
        style={{ transformStyle: "preserve-3d" }}
      >
        <Card
          className="absolute inset-0 flex flex-col items-start justify-start text-left [backface-visibility:hidden]"
          hoverLift={false}
          padding={false}
        >
          <div className="p-6">{front}</div>
        </Card>
        <Card
          className="absolute inset-0 flex flex-col items-start justify-center text-left [backface-visibility:hidden]"
          hoverLift={false}
          padding={false}
          style={{ transform: "rotateY(180deg)" }}
        >
          <div className="p-6">
            {badge && (
              <p className="mb-2 text-[var(--font-caption)] font-semibold text-[var(--text-tertiary)]">
                {badge}
              </p>
            )}
            <h3 className="mb-2 text-[var(--font-h3)] font-semibold">{title}</h3>
            <p className="text-[var(--font-body-sm)] text-[var(--text-secondary)]">{description}</p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

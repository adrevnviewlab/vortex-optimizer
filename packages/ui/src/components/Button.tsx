"use client";

import { useState, forwardRef, type MouseEvent } from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { cn, springConfig } from "../lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--brand-primary)] text-[var(--text-inverse)] hover:bg-[var(--brand-primary-hover)] border-transparent font-semibold",
  secondary:
    "bg-transparent text-[var(--text-primary)] border-[var(--text-primary)] hover:bg-[var(--surface-sunken)] font-semibold",
  ghost:
    "bg-transparent text-[var(--text-secondary)] border-transparent hover:bg-[var(--brand-primary-muted)] hover:text-[var(--brand-primary)]",
  danger:
    "bg-[var(--status-red-bg)] text-[var(--status-red)] border-[var(--status-red-border)] hover:bg-[var(--status-red)] hover:text-white",
};

const sizeStyles = {
  sm: "h-8 px-3 text-[var(--font-body-sm)]",
  md: "h-9 px-4 text-[var(--font-body-sm)]",
  lg: "h-11 px-6 text-[var(--font-body-sm)]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading,
      className,
      children,
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    const shouldReduceMotion = useReducedMotion();
    const [tracing, setTracing] = useState(false);

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
      if (variant === "primary" && !shouldReduceMotion) {
        setTracing(true);
        setTimeout(() => setTracing(false), 600);
      }
      onClick?.(e);
    };

    return (
      <motion.button
        ref={ref}
        whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
        transition={springConfig}
        onClick={handleClick}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-[var(--button-radius)] border font-medium",
          "transition-colors duration-[var(--duration-fast)]",
          "disabled:opacity-50 disabled:pointer-events-none",
          "cursor-pointer select-none",
          variant === "primary" && "spring-action-rainbow",
          tracing && "is-tracing",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? "Loading…" : children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";
import { cn, springConfig } from "../lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--brand-primary)] text-[var(--text-inverse)] hover:bg-[var(--brand-primary-hover)] border-transparent",
  secondary:
    "bg-[var(--surface-raised)] text-[var(--text-primary)] border-[var(--border-default)] hover:bg-[var(--surface-sunken)]",
  ghost:
    "bg-transparent text-[var(--text-secondary)] border-transparent hover:bg-[var(--brand-primary-muted)] hover:text-[var(--brand-primary)]",
  danger:
    "bg-[var(--status-red-bg)] text-[var(--status-red)] border-[var(--status-red-border)] hover:bg-[var(--status-red)] hover:text-white",
};

const sizeStyles = {
  sm: "h-8 px-3 text-[var(--font-body-sm)]",
  md: "h-9 px-4 text-[var(--font-body)]",
  lg: "h-11 px-6 text-[var(--font-body)]",
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
      ...props
    },
    ref
  ) => {
    const shouldReduceMotion = useReducedMotion();

    return (
      <motion.button
        ref={ref}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
        transition={springConfig}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-[var(--button-radius)] border font-medium",
          "transition-colors duration-[var(--duration-fast)]",
          "disabled:opacity-50 disabled:pointer-events-none",
          "cursor-pointer select-none",
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

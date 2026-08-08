"use client";

import {
  forwardRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn, springConfig } from "../lib/cn";

export interface CardProps {
  header?: ReactNode;
  footer?: ReactNode;
  padding?: boolean;
  className?: string;
  children?: ReactNode;
  style?: CSSProperties;
  onClick?: () => void;
  /** Spring lift on hover (default true). Disable for flip faces / nested transforms. */
  hoverLift?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      header,
      footer,
      padding = true,
      className,
      children,
      style,
      onClick,
      hoverLift = true,
    },
    ref
  ) => {
    const shouldReduceMotion = useReducedMotion();

    return (
      <motion.div
        ref={ref}
        whileHover={
          shouldReduceMotion || !hoverLift ? undefined : { y: -2 }
        }
        transition={springConfig}
        onClick={onClick}
        className={cn(
          "rounded-[var(--card-radius)] border border-[var(--border-default)]",
          "bg-[var(--surface-raised)]",
          hoverLift && "hover:bg-[var(--surface-zebra)]",
          onClick && "cursor-pointer",
          className
        )}
        style={style}
      >
        {header && (
          <div className="border-b border-[var(--border-default)] px-4 py-3 font-semibold text-[var(--font-h3)]">
            {header}
          </div>
        )}
        <div className={padding ? "p-4" : undefined}>{children}</div>
        {footer && (
          <div className="border-t border-[var(--border-default)] px-4 py-3">{footer}</div>
        )}
      </motion.div>
    );
  }
);

Card.displayName = "Card";

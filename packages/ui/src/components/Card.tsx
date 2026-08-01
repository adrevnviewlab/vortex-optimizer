"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../lib/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  header?: ReactNode;
  footer?: ReactNode;
  padding?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ header, footer, padding = true, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-[var(--card-radius)] border border-[var(--border-default)]",
          "bg-[var(--surface-raised)] shadow-[var(--shadow-xs)]",
          "transition-[transform,box-shadow] duration-200 ease-[var(--ease-out)]",
          "hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)]",
          "motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-[var(--shadow-sm)]",
          className
        )}
        {...props}
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
      </div>
    );
  }
);

Card.displayName = "Card";

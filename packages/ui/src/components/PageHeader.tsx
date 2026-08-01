import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export interface PageHeaderProps {
  title: string;
  breadcrumb?: string;
  actions?: ReactNode;
  className?: string;
}

/** Subtle eyebrow title — no giant H1 above first-row stats (rule §3.17). */
export function PageHeader({ title, breadcrumb, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-5 flex flex-wrap items-center justify-between gap-3", className)}>
      <div>
        {breadcrumb && (
          <p className="mb-0.5 text-[var(--font-caption)] text-[var(--text-tertiary)]">
            {breadcrumb}
          </p>
        )}
        <h1 className="text-[var(--font-caption)] font-medium uppercase tracking-[var(--tracking-wide)] text-[var(--text-tertiary)]">
          {title}
        </h1>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

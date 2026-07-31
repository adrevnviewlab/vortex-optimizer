import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export interface PageHeaderProps {
  title: string;
  breadcrumb?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, breadcrumb, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-6 flex flex-wrap items-center justify-between gap-4", className)}>
      <div>
        {breadcrumb && (
          <p className="mb-0.5 text-[var(--font-caption)] text-[var(--text-tertiary)]">
            {breadcrumb}
          </p>
        )}
        <h1
          className="text-[var(--font-h2)] font-semibold tracking-[var(--tracking-tight)] text-[var(--text-primary)]"
        >
          {title}
        </h1>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

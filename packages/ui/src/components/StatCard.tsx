"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "../lib/cn";
import { Card } from "./Card";

export interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaTone?: "positive" | "negative" | "neutral" | "warning";
  icon?: LucideIcon;
  accent?: string;
  className?: string;
}

const deltaStyles = {
  positive: "text-[var(--status-green)] bg-[var(--status-green-bg)]",
  negative: "text-[var(--status-red)] bg-[var(--status-red-bg)]",
  neutral: "text-[var(--text-secondary)] bg-[var(--surface-sunken)]",
  warning: "text-[var(--status-amber)] bg-[var(--status-amber-bg)]",
};

export function StatCard({
  label,
  value,
  delta,
  deltaTone = "neutral",
  icon: Icon,
  accent = "var(--trace-a)",
  className,
}: StatCardProps) {
  return (
    <Card
      padding={false}
      className={cn("overflow-hidden hover:translate-y-0 hover:shadow-[var(--shadow-sm)]", className)}
    >
      <div className="h-0.5" style={{ backgroundColor: accent }} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[var(--font-caption)] font-medium uppercase tracking-[var(--tracking-wide)] text-[var(--text-tertiary)]">
              {label}
            </p>
            <p className="mt-1 text-[1.75rem] font-semibold leading-[var(--leading-tight)] tracking-[var(--tracking-tight)]">
              {value}
            </p>
            {delta && (
              <span
                className={cn(
                  "mt-2 inline-block rounded-[var(--pill-radius)] px-2 py-0.5 text-[var(--font-caption)] font-medium",
                  deltaStyles[deltaTone],
                )}
              >
                {delta}
              </span>
            )}
          </div>
          {Icon && (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-primary-subtle)]">
              <Icon size={16} className="text-[var(--brand-primary)]" strokeWidth={2} />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

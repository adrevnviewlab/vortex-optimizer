"use client";

import { Check, Circle } from "lucide-react";
import { cn } from "../lib/cn";
import { Button } from "./Button";

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
  href?: string;
}

export interface OnboardingChecklistProps {
  items: ChecklistItem[];
  onDismiss?: () => void;
  primaryAction?: { label: string; href: string };
}

export function OnboardingChecklist({ items, onDismiss, primaryAction }: OnboardingChecklistProps) {
  const completed = items.filter((i) => i.done).length;

  return (
    <div className="rounded-[var(--card-radius)] border border-[var(--border-default)] bg-[var(--surface-raised)] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[var(--font-h2)] font-semibold tracking-[var(--tracking-tight)]">
            Get started with Vortex Optimizer
          </h2>
          <p className="mt-1 text-[var(--font-body-sm)] text-[var(--text-secondary)]">
            {completed} of {items.length} steps complete
          </p>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-[var(--font-caption)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
          >
            Dismiss
          </button>
        )}
      </div>

      <ul className="mt-6 space-y-3">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-3">
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full",
                item.done
                  ? "bg-[var(--status-green-bg)] text-[var(--status-green)]"
                  : "border border-[var(--border-strong)] text-[var(--text-tertiary)]",
              )}
            >
              {item.done ? <Check size={14} /> : <Circle size={14} />}
            </span>
            {item.href && !item.done ? (
              <a
                href={item.href}
                className="text-[var(--font-body-sm)] text-[var(--brand-primary)] hover:underline"
              >
                {item.label}
              </a>
            ) : (
              <span
                className={cn(
                  "text-[var(--font-body-sm)]",
                  item.done ? "text-[var(--text-tertiary)] line-through" : "text-[var(--text-primary)]",
                )}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ul>

      {primaryAction && (
        <div className="mt-6">
          <a href={primaryAction.href}>
            <Button>{primaryAction.label}</Button>
          </a>
        </div>
      )}
    </div>
  );
}

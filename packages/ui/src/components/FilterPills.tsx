"use client";

import { cn } from "../lib/cn";

export interface FilterPillOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

export interface FilterPillsProps<T extends string> {
  options: FilterPillOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function FilterPills<T extends string>({
  options,
  value,
  onChange,
  className,
}: FilterPillsProps<T>) {
  return (
    <div
      className={cn(
        "inline-flex flex-wrap gap-1 rounded-[var(--button-radius)] border border-[var(--border-default)] bg-[var(--surface-raised)] p-0.5",
        className,
      )}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-[var(--button-radius)] px-3 py-1.5 text-[var(--font-body-sm)] capitalize transition-colors",
            value === opt.value
              ? "bg-[var(--brand-primary-muted)] font-medium text-[var(--brand-primary)]"
              : "text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)]",
          )}
        >
          {opt.label}
          {opt.count !== undefined && (
            <span className="ml-1 text-[var(--text-tertiary)]">({opt.count})</span>
          )}
        </button>
      ))}
    </div>
  );
}

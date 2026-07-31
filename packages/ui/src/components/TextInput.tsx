"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../lib/cn";

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[var(--font-body-sm)] font-medium text-[var(--text-secondary)]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-10 w-full rounded-[var(--input-radius)] border border-[var(--border-default)]",
            "bg-[var(--surface-sunken)] px-3 text-[var(--font-body)] text-[var(--text-primary)]",
            "placeholder:text-[var(--text-tertiary)]",
            "focus:border-[var(--border-focus)] focus:bg-[var(--surface-raised)] focus:outline-none",
            "transition-colors duration-[var(--duration-fast)]",
            error && "border-[var(--status-red-border)]",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-[var(--font-caption)] text-[var(--status-red)]">{error}</p>
        )}
        {hint && !error && (
          <p className="text-[var(--font-caption)] text-[var(--text-tertiary)]">{hint}</p>
        )}
      </div>
    );
  }
);

TextInput.displayName = "TextInput";

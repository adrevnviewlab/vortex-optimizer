import { cn } from "../lib/cn";

export type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "brand";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-[var(--surface-sunken)] text-[var(--text-secondary)] border-[var(--border-default)]",
  success: "bg-[var(--status-green-bg)] text-[var(--status-green)] border-[var(--status-green-border)]",
  warning: "bg-[var(--status-amber-bg)] text-[var(--status-amber)] border-[var(--status-amber-border)]",
  danger: "bg-[var(--status-red-bg)] text-[var(--status-red)] border-[var(--status-red-border)]",
  info: "bg-[var(--semantic-info-bg)] text-[var(--semantic-info)] border-[var(--border-default)]",
  brand: "bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)] border-transparent",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--pill-radius)] border px-2 py-0.5",
        "text-[var(--font-caption)] font-medium uppercase tracking-[var(--tracking-wide)]",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

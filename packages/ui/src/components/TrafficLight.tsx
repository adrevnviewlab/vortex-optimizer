import { cn, type RagStatus } from "../lib/cn";

export interface TrafficLightProps {
  status: RagStatus;
  label?: string;
  showLabel?: boolean;
  className?: string;
}

const statusColors: Record<RagStatus, string> = {
  red: "bg-[var(--status-red)]",
  amber: "bg-[var(--status-amber)]",
  green: "bg-[var(--status-green)]",
};

const statusLabels: Record<RagStatus, string> = {
  red: "Critical",
  amber: "Review",
  green: "Optimized",
};

export function TrafficLight({
  status,
  label,
  showLabel = false,
  className,
}: TrafficLightProps) {
  const displayLabel = label ?? statusLabels[status];

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn("h-2.5 w-2.5 shrink-0 rounded-full", statusColors[status])}
        role="img"
        aria-label={displayLabel}
      />
      {showLabel && (
        <span className="text-[var(--font-body-sm)] text-[var(--text-secondary)]">
          {displayLabel}
        </span>
      )}
    </span>
  );
}

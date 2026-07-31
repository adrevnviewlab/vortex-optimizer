import { Badge } from "./Badge";
import type { RagStatus } from "../lib/cn";

export interface ReadinessBadgeProps {
  status: RagStatus;
  label?: string;
}

const readinessLabels: Record<RagStatus, string> = {
  red: "Not ready",
  amber: "Partial",
  green: "Ready",
};

const readinessVariants: Record<RagStatus, "danger" | "warning" | "success"> = {
  red: "danger",
  amber: "warning",
  green: "success",
};

export function ReadinessBadge({ status, label }: ReadinessBadgeProps) {
  return (
    <Badge variant={readinessVariants[status]}>
      {label ?? readinessLabels[status]}
    </Badge>
  );
}

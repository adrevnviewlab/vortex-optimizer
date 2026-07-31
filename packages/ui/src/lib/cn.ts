export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export const springConfig = {
  type: "spring" as const,
  stiffness: 380,
  damping: 28,
};

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export type RagStatus = "red" | "amber" | "green";

export function computeTrafficLight(
  complianceScore: number,
  savingsPercent: number
): RagStatus {
  if (complianceScore < 70 || savingsPercent > 20) return "red";
  if (complianceScore < 90 || savingsPercent >= 10) return "amber";
  return "green";
}

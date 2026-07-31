export interface RegionLabelProps {
  region?: string;
  className?: string;
}

const DEFAULT_CURRENCY = "USD";

const REGION_LABELS: Record<string, string> = {
  US: "United States",
  EU: "European Union",
  UK: "United Kingdom",
  APAC: "Asia-Pacific",
};

export function RegionLabel({ region = "US", className }: RegionLabelProps) {
  const label = REGION_LABELS[region] ?? region;

  return (
    <span
      className={className}
      title={`Default region: ${label}. Prices shown in ${DEFAULT_CURRENCY}.`}
    >
      {region} · {DEFAULT_CURRENCY}
    </span>
  );
}

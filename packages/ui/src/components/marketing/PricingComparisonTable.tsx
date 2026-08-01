export interface ComparisonRow {
  feature: string;
  starter: string | boolean;
  professional: string | boolean;
  enterprise: string | boolean;
}

export interface PricingComparisonTableProps {
  title?: string;
  description?: string;
  rows: ComparisonRow[];
}

function CellValue({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <span className="text-[var(--status-green)]" aria-label="Included">
        ✓
      </span>
    ) : (
      <span className="text-[var(--text-tertiary)]" aria-label="Not included">
        —
      </span>
    );
  }
  return <span className="text-[var(--font-body-sm)]">{value}</span>;
}

export function PricingComparisonTable({
  title = "Compare plans",
  description = "A quick side-by-side of what each plan covers for your advisory practice.",
  rows,
}: PricingComparisonTableProps) {
  return (
    <section className="mt-16">
      <div className="mb-8 text-center">
        <h2
          className="font-semibold tracking-[var(--tracking-tight)]"
          style={{ fontFamily: "var(--font-display-family)", fontSize: "var(--font-h2)" }}
        >
          {title}
        </h2>
        {description && (
          <p className="mt-3 text-[var(--font-body)] text-[var(--text-secondary)]">{description}</p>
        )}
      </div>
      <div className="overflow-x-auto rounded-[var(--card-radius)] border border-[var(--border-default)]">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--border-default)] bg-[var(--surface-sunken)]">
              <th className="px-4 py-3 text-[var(--font-body-sm)] font-semibold">Feature</th>
              <th className="px-4 py-3 text-[var(--font-body-sm)] font-semibold">Starter</th>
              <th className="px-4 py-3 text-[var(--font-body-sm)] font-semibold text-[var(--brand-primary)]">
                Professional
              </th>
              <th className="px-4 py-3 text-[var(--font-body-sm)] font-semibold">Enterprise</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.feature} className="border-b border-[var(--border-default)] last:border-0">
                <td className="px-4 py-3 text-[var(--font-body-sm)] font-medium">{row.feature}</td>
                <td className="px-4 py-3 text-center">
                  <CellValue value={row.starter} />
                </td>
                <td className="bg-[var(--brand-primary-muted)]/30 px-4 py-3 text-center">
                  <CellValue value={row.professional} />
                </td>
                <td className="px-4 py-3 text-center">
                  <CellValue value={row.enterprise} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

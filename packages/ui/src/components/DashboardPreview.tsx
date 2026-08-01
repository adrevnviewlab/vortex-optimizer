import { Card } from "./Card";
import { formatCurrency } from "../lib/cn";

const previewStats: Array<{
  label: string;
  value: string;
  sub: string;
  accent: string;
}> = [
  { label: "Clients", value: "12", sub: "active orgs", accent: "var(--trace-a)" },
  { label: "Audits", value: "8", sub: "in progress", accent: "var(--trace-d)" },
  { label: "Savings", value: formatCurrency(84200), sub: "identified YTD", accent: "var(--status-brass)" },
  { label: "Compliance", value: "72%", sub: "health score", accent: "var(--trace-c)" },
  { label: "Renewals", value: "3", sub: "due in 90 days", accent: "var(--border-strong)" },
  { label: "Reports", value: "24", sub: "exported this quarter", accent: "var(--trace-c)" },
];

export function DashboardPreview() {
  return (
    <section className="bg-[var(--surface-sunken)] py-16 md:py-24">
      <div className="mx-auto max-w-[var(--content-max-width)] px-4 md:px-6">
        <p className="mb-2 text-center text-[var(--font-caption)] font-medium uppercase tracking-[var(--tracking-wide)] text-[var(--brand-primary)]">
          Live sample
        </p>
        <h2
          className="mb-3 text-center font-light tracking-[var(--tracking-tight)]"
          style={{ fontSize: "var(--font-h1)" }}
        >
          Your licensing command center
        </h2>
        <p className="mx-auto mb-8 max-w-xl text-center text-[var(--font-body-sm)] text-[var(--text-secondary)]">
          Mock data — savings, compliance RAG, and client-ready reports in one view. No login required.
        </p>
        <Card className="overflow-hidden hover:translate-y-0 hover:shadow-[var(--shadow-md)]" padding={false}>
          <div className="flex items-center justify-between border-b border-[var(--border-default)] bg-[var(--surface-raised)] px-4 py-3">
            <div>
              <p className="text-[var(--font-caption)] text-[var(--text-tertiary)]">Contoso Ltd</p>
              <p className="text-[var(--font-h3)] font-semibold">Dashboard</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-[var(--pill-radius)] bg-[var(--status-green-bg)] px-2.5 py-0.5 text-[var(--font-caption)] font-medium text-[var(--status-green)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--status-green)]" />
              sample
            </span>
          </div>
          <div className="p-4 md:p-6">
            <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              {previewStats.map((stat) => (
                <div
                  key={stat.label}
                  className="overflow-hidden rounded-[var(--button-radius)] border border-[var(--border-default)] bg-[var(--surface-raised)]"
                >
                  <div className="h-0.5" style={{ backgroundColor: stat.accent }} />
                  <div className="p-3">
                    <p className="text-[var(--font-caption)] font-medium uppercase tracking-[var(--tracking-wide)] text-[var(--text-tertiary)]">
                      {stat.label}
                    </p>
                    <p className="mt-1 text-lg font-semibold leading-tight">{stat.value}</p>
                    <p className="mt-0.5 text-[var(--font-caption)] text-[var(--text-tertiary)]">{stat.sub}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[var(--button-radius)] border border-[var(--border-default)] bg-[var(--brand-primary-subtle)] p-4">
                <p className="text-[var(--font-caption)] font-medium uppercase tracking-[var(--tracking-wide)] text-[var(--text-tertiary)]">
                  Top findings
                </p>
                <ul className="mt-3 space-y-2">
                  {[
                    { label: "Inactive E5 users", rag: "var(--status-red)", savings: "$18,400" },
                    { label: "Duplicate Teams Phone", rag: "var(--status-amber)", savings: "$6,200" },
                    { label: "Azure RI opportunity", rag: "var(--status-green)", savings: "$12,100" },
                  ].map((item) => (
                    <li
                      key={item.label}
                      className="flex items-center justify-between rounded-[var(--button-radius)] bg-[var(--surface-raised)] px-3 py-2 text-[var(--font-body-sm)]"
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: item.rag }}
                        />
                        {item.label}
                      </span>
                      <span className="font-medium text-[var(--brand-primary)]">{item.savings}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col items-center justify-center rounded-[var(--button-radius)] border border-[var(--border-default)] bg-[var(--surface-raised)] p-6">
                <div className="relative h-28 w-28">
                  <div
                    className="absolute inset-0 rounded-full border-[12px] border-r-[var(--border-default)] border-b-[var(--border-default)]"
                    style={{ borderTopColor: "var(--brand-primary)", borderLeftColor: "var(--brand-primary)" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-semibold">72%</span>
                  </div>
                </div>
                <p className="mt-3 text-[var(--font-body-sm)] text-[var(--text-secondary)]">
                  Compliance health score
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

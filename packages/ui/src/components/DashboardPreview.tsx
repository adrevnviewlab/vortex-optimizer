import { Card } from "./Card";
import { formatCurrency } from "../lib/cn";

const previewStats: Array<{
  label: string;
  value: string;
  sub: string;
  rag?: "red" | "amber" | "green";
}> = [
  { label: "Clients", value: "12", sub: "active orgs" },
  { label: "Audits", value: "8", sub: "in progress" },
  { label: "Savings", value: formatCurrency(84200), sub: "identified YTD" },
  { label: "Compliance", value: "72%", sub: "health score", rag: "amber" as const },
];

export function DashboardPreview() {
  return (
    <section className="bg-[var(--surface-sunken)] py-16 md:py-24">
      <div className="mx-auto max-w-[var(--content-max-width)] px-4 md:px-6">
        <p className="mb-2 text-center text-[var(--font-caption)] font-medium uppercase tracking-[var(--tracking-wide)] text-[var(--brand-primary)]">
          Live sample
        </p>
        <h2
          className="mb-3 text-center font-semibold tracking-[var(--tracking-tight)]"
          style={{ fontFamily: "var(--font-display-family)", fontSize: "var(--font-h1)" }}
        >
          Your licensing command center
        </h2>
        <p className="mx-auto mb-8 max-w-xl text-center text-[var(--font-body-sm)] text-[var(--text-secondary)]">
          Mock data — savings, compliance RAG, and client-ready reports in one view. No login required.
        </p>
        <Card className="overflow-hidden hover:translate-y-0 hover:shadow-[var(--shadow-md)]" padding={false}>
          <div className="flex items-center justify-between border-b border-[var(--border-default)] bg-[var(--surface-sunken)] px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-[var(--status-red)] opacity-60" />
                <span className="h-3 w-3 rounded-full bg-[var(--status-amber)] opacity-60" />
                <span className="h-3 w-3 rounded-full bg-[var(--status-green)] opacity-60" />
              </div>
              <span className="text-[var(--font-body-sm)] text-[var(--text-secondary)]">
                Contoso Ltd / Dashboard
              </span>
            </div>
            <span className="rounded-[var(--pill-radius)] bg-[var(--status-green-bg)] px-2 py-0.5 text-[var(--font-caption)] font-medium text-[var(--status-green)]">
              sample
            </span>
          </div>
          <div className="p-6">
            <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              {previewStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-raised)] p-4"
                >
                  <p className="flex items-center gap-2 text-[var(--font-caption)] uppercase tracking-[var(--tracking-wide)] text-[var(--text-tertiary)]">
                    {stat.rag && (
                      <span
                        className={`h-2 w-2 rounded-full ${
                          stat.rag === "amber"
                            ? "bg-[var(--status-amber)]"
                            : stat.rag === "red"
                              ? "bg-[var(--status-red)]"
                              : "bg-[var(--status-green)]"
                        }`}
                      />
                    )}
                    {stat.label}
                  </p>
                  <p className="mt-1 text-xl font-semibold">{stat.value}</p>
                  <p className="text-[var(--font-caption)] text-[var(--text-tertiary)]">{stat.sub}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-[var(--border-default)] bg-[var(--brand-primary-muted)] p-4">
                <p className="text-[var(--font-caption)] uppercase tracking-[var(--tracking-wide)] text-[var(--text-tertiary)]">
                  Top findings
                </p>
                <ul className="mt-3 space-y-2">
                  {[
                    { label: "Inactive E5 users", rag: "red", savings: "$18,400" },
                    { label: "Duplicate Teams Phone", rag: "amber", savings: "$6,200" },
                    { label: "Azure RI opportunity", rag: "green", savings: "$12,100" },
                  ].map((item) => (
                    <li
                      key={item.label}
                      className="flex items-center justify-between rounded bg-[var(--surface-raised)] px-3 py-2 text-[var(--font-body-sm)]"
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            item.rag === "red"
                              ? "bg-[var(--status-red)]"
                              : item.rag === "amber"
                                ? "bg-[var(--status-amber)]"
                                : "bg-[var(--status-green)]"
                          }`}
                        />
                        {item.label}
                      </span>
                      <span className="font-medium text-[var(--brand-primary)]">{item.savings}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col items-center justify-center rounded-lg border border-[var(--border-default)] p-6">
                <div className="relative h-28 w-28">
                  <div className="absolute inset-0 rounded-full border-[12px] border-[var(--brand-primary)] border-r-[var(--border-default)] border-b-[var(--border-default)]" />
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

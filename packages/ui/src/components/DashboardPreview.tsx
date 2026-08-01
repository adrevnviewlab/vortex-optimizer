import { Card } from "./Card";

export function DashboardPreview() {
  return (
    <section className="bg-[var(--surface-sunken)] py-16 md:py-24">
      <div className="mx-auto max-w-[var(--content-max-width)] px-4 md:px-6">
        <p className="mb-2 text-center text-[var(--font-caption)] font-medium uppercase tracking-[var(--tracking-wide)] text-[var(--text-tertiary)]">
          Platform preview
        </p>
        <h2
          className="mb-3 text-center font-semibold tracking-[var(--tracking-tight)]"
          style={{ fontFamily: "var(--font-display-family)", fontSize: "var(--font-h1)" }}
        >
          Your licensing command center
        </h2>
        <p className="mx-auto mb-8 max-w-xl text-center text-[var(--font-body-sm)] text-[var(--text-secondary)]">
          Independent advisory dashboard — savings, compliance RAG, and client-ready reports in one view.
        </p>
        <Card className="overflow-hidden hover:translate-y-0 hover:shadow-[var(--shadow-md)]" padding={false}>
          <div className="border-b border-[var(--border-default)] bg-[var(--surface-sunken)] px-4 py-3">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[var(--status-red)] opacity-60" />
              <span className="h-3 w-3 rounded-full bg-[var(--status-amber)] opacity-60" />
              <span className="h-3 w-3 rounded-full bg-[var(--status-green)] opacity-60" />
            </div>
          </div>
          <div className="p-6">
            <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              {["Clients", "Audits", "Savings", "Compliance"].map((label) => (
                <div key={label} className="rounded-lg border border-[var(--border-default)] p-4">
                  <p className="text-[var(--font-caption)] uppercase tracking-[var(--tracking-wide)] text-[var(--text-tertiary)]">
                    {label}
                  </p>
                  <p className="mt-1 text-xl font-semibold">—</p>
                </div>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-40 rounded-lg bg-[var(--brand-primary-muted)]" />
              <div className="flex h-40 items-center justify-center rounded-lg border border-[var(--border-default)]">
                <div className="h-24 w-24 rounded-full border-[12px] border-[var(--brand-primary)] border-r-[var(--border-default)] border-b-[var(--border-default)]" />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

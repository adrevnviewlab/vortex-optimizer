"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Card,
  computeTrafficLight,
  DataTable,
  formatCurrency,
  ListPageSkeleton,
  PageHeader,
  TrafficLight,
} from "@vorzop/ui";
import { CalendarDays } from "lucide-react";
import { fetchRenewals, type RenewalItem } from "@/lib/api-client";

export default function RenewalsPage() {
  const [renewals, setRenewals] = useState<RenewalItem[] | null>(null);
  const [view, setView] = useState<"list" | "calendar">("list");

  useEffect(() => {
    fetchRenewals().then(({ renewals: rows }) => setRenewals(rows));
  }, []);

  const sorted = useMemo(
    () => (renewals ? [...renewals].sort((a, b) => a.daysUntil - b.daysUntil) : []),
    [renewals],
  );

  if (!renewals) return <ListPageSkeleton rows={5} cols={6} />;

  return (
    <>
      <PageHeader
        title="Renewals"
        actions={
          <div className="flex rounded-[var(--button-radius)] border border-[var(--border-default)] p-0.5">
            {(["list", "calendar"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`rounded-[var(--button-radius)] px-3 py-1.5 text-[var(--font-body-sm)] capitalize ${
                  view === v
                    ? "bg-[var(--brand-primary-muted)] text-[var(--brand-primary)]"
                    : "text-[var(--text-secondary)]"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        }
      />

      {view === "list" ? (
        <Card>
          <DataTable
            data={sorted}
            columns={[
              { key: "client", header: "Client", sortable: true },
              { key: "renewalDate", header: "Renewal date", sortable: true },
              {
                key: "daysUntil",
                header: "Days until",
                sortable: true,
                render: (row) => (
                  <Badge variant={row.daysUntil <= 30 ? "danger" : row.daysUntil <= 90 ? "warning" : "success"}>
                    {row.daysUntil} days
                  </Badge>
                ),
              },
              { key: "licenses", header: "Licenses", sortable: true },
              {
                key: "spend",
                header: "Monthly spend",
                render: (row) => formatCurrency(row.spend),
              },
              { key: "scenario", header: "Scenario" },
              {
                key: "health",
                header: "Urgency",
                render: (row) => (
                  <TrafficLight
                    status={computeTrafficLight(
                      row.daysUntil <= 30 ? 60 : row.daysUntil <= 90 ? 75 : 95,
                      row.daysUntil <= 30 ? 25 : 10,
                    )}
                  />
                ),
              },
            ]}
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((r) => (
            <Card key={r.id}>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--brand-primary-muted)]">
                  <CalendarDays size={20} className="text-[var(--brand-primary)]" />
                </div>
                <div>
                  <h3 className="font-semibold">{r.client}</h3>
                  <p className="text-[var(--font-body-sm)] text-[var(--text-secondary)]">
                    {r.renewalDate}
                  </p>
                  <Badge
                    className="mt-2"
                    variant={r.daysUntil <= 30 ? "danger" : "warning"}
                  >
                    {r.daysUntil} days
                  </Badge>
                  <p className="mt-2 text-[var(--font-caption)] text-[var(--text-tertiary)]">
                    {r.scenario}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

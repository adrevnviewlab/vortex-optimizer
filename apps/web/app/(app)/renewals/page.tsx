"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Card,
  computeTrafficLight,
  DataTable,
  FilterPills,
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
          <FilterPills
            options={[
              { value: "list", label: "List" },
              { value: "calendar", label: "Calendar" },
            ]}
            value={view}
            onChange={setView}
          />
        }
      />

      {view === "list" ? (
        <Card header="Upcoming renewals">
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
          {sorted.map((r) => {
            const urgent = r.daysUntil <= 30;
            const soon = r.daysUntil <= 90;
            return (
              <Card key={r.id} padding={false} className="overflow-hidden hover:translate-y-0">
                <div
                  className={`h-0.5 ${urgent ? "bg-[var(--status-red)]" : soon ? "bg-[var(--status-amber)]" : "bg-[var(--status-green)]"}`}
                />
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--brand-primary-subtle)]">
                      <CalendarDays size={20} className="text-[var(--brand-primary)]" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{r.client}</h3>
                      <p className="text-[var(--font-body-sm)] text-[var(--text-secondary)]">
                        {r.renewalDate}
                      </p>
                      <Badge
                        className="mt-2"
                        variant={urgent ? "danger" : soon ? "warning" : "success"}
                      >
                        {r.daysUntil} days
                      </Badge>
                      <p className="mt-2 text-[var(--font-caption)] text-[var(--text-tertiary)]">
                        {r.scenario}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

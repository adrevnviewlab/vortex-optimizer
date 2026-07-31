"use client";

import { useEffect, useState } from "react";
import {
  Badge,
  Card,
  computeTrafficLight,
  DataTable,
  formatCurrency,
  PageHeader,
  SpringActionButton,
  TableRowSkeleton,
  TrafficLight,
} from "@vorzop/ui";
import { fetchClients, type ClientListItem } from "@/lib/api-client";

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientListItem[] | null>(null);

  useEffect(() => {
    fetchClients(undefined, { limit: 50, offset: 0 }).then(({ clients: rows }) =>
      setClients(rows),
    );
  }, []);

  if (!clients) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 animate-pulse rounded bg-[var(--surface-sunken)]" />
        <Card>
          <TableRowSkeleton cols={7} />
          <TableRowSkeleton cols={7} />
          <TableRowSkeleton cols={7} />
        </Card>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Clients"
        actions={<SpringActionButton label="New Client" />}
      />

      <Card>
        <DataTable
          data={clients}
          columns={[
            {
              key: "name",
              header: "Client name",
              sortable: true,
              render: (row) => (
                <span className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--brand-primary-subtle)] text-[var(--font-caption)] font-semibold text-[var(--brand-primary)]">
                    {row.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2)}
                  </span>
                  {row.name}
                </span>
              ),
            },
            { key: "region", header: "Region", sortable: true },
            { key: "tenantId", header: "Tenant ID", sortable: true },
            { key: "licenses", header: "Licenses", sortable: true },
            { key: "lastAudit", header: "Last audit", sortable: true },
            {
              key: "spend",
              header: "Monthly spend",
              sortable: true,
              render: (row) => formatCurrency(row.spend),
            },
            {
              key: "status",
              header: "Status",
              render: (row) => (
                <Badge variant={row.status === "Renewal" ? "warning" : "success"}>
                  {row.status}
                </Badge>
              ),
            },
            {
              key: "health",
              header: "Health",
              render: (row) => (
                <TrafficLight status={computeTrafficLight(row.compliance, row.savingsPct)} />
              ),
            },
          ]}
        />
      </Card>
    </>
  );
}

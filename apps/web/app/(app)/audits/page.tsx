"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Badge,
  Card,
  computeTrafficLight,
  DataTable,
  formatCurrency,
  ListPageSkeleton,
  PageHeader,
  SpringActionButton,
  TrafficLight,
} from "@vorzop/ui";
import { fetchAudits, type AuditListItem } from "@/lib/api-client";

const statusVariant: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  Complete: "success",
  Running: "info",
  Draft: "default",
  Failed: "danger",
};

export default function AuditsPage() {
  const router = useRouter();
  const [audits, setAudits] = useState<AuditListItem[] | null>(null);

  useEffect(() => {
    fetchAudits().then(({ audits: rows }) => setAudits(rows));
  }, []);

  if (!audits) return <ListPageSkeleton rows={5} cols={7} />;

  return (
    <>
      <PageHeader
        title="Audits"
        actions={
          <SpringActionButton
            label="New Audit"
            onClick={() => router.push("/clients")}
          />
        }
      />

      <Card header="All audits">
        <DataTable
          data={audits}
          onRowClick={(row) => {
            router.push(`/audits/${row.id}`);
          }}
          columns={[
            {
              key: "client",
              header: "Client",
              sortable: true,
              render: (row) => (
                <span className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--brand-primary-subtle)] text-[var(--font-caption)] font-semibold text-[var(--brand-primary)]">
                    {row.client.split(" ").map((w: string) => w[0]).join("").slice(0, 2)}
                  </span>
                  {row.client}
                </span>
              ),
            },
            { key: "date", header: "Audit date", sortable: true },
            { key: "skus", header: "SKUs scanned", sortable: true },
            {
              key: "issues",
              header: "Issues found",
              sortable: true,
              render: (row) => (
                <Badge variant={row.issues > 0 ? "danger" : "success"}>{row.issues}</Badge>
              ),
            },
            {
              key: "savings",
              header: "Savings identified",
              sortable: true,
              render: (row) => formatCurrency(row.savings),
            },
            {
              key: "status",
              header: "Status",
              render: (row) => (
                <Badge variant={statusVariant[row.status] ?? "default"}>{row.status}</Badge>
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

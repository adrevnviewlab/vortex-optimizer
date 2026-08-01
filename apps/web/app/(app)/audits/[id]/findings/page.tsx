"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Badge,
  Button,
  Card,
  DataTable,
  FilterPills,
  formatCurrency,
  ListPageSkeleton,
  PageHeader,
  TrafficLight,
  type RagStatus,
} from "@vorzop/ui";
import { fetchFindings, type FindingItem } from "@/lib/api-client";

type SeverityFilter = "all" | "critical" | "high" | "medium" | "low";

function severityTrafficLight(severity: string): RagStatus {
  if (severity === "critical" || severity === "high") return "red";
  if (severity === "medium") return "amber";
  return "green";
}

const severityVariant: Record<string, "danger" | "warning" | "success" | "default" | "info"> = {
  critical: "danger",
  high: "danger",
  medium: "warning",
  low: "success",
  info: "default",
};

export default function FindingsPage() {
  const params = useParams();
  const router = useRouter();
  const auditId = params.id as string;
  const [findings, setFindings] = useState<FindingItem[] | null>(null);
  const [filter, setFilter] = useState<SeverityFilter>("all");

  const load = useCallback(async () => {
    const { findings: rows } = await fetchFindings(auditId);
    setFindings(rows);
  }, [auditId]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!findings) return [];
    if (filter === "all") return findings;
    return findings.filter((f) => f.severity === filter);
  }, [findings, filter]);

  const filterOptions = useMemo(
    () =>
      (["all", "critical", "high", "medium", "low"] as SeverityFilter[]).map((s) => ({
        value: s,
        label: s,
        count: s === "all" ? undefined : findings?.filter((f) => f.severity === s).length,
      })),
    [findings],
  );

  if (!findings) return <ListPageSkeleton rows={8} cols={6} />;

  return (
    <>
      <PageHeader
        title="Findings"
        breadcrumb={`Audit · ${auditId.slice(0, 8)}…`}
        actions={
          <Button variant="ghost" size="sm" onClick={() => router.push(`/audits/${auditId}`)}>
            ← Back to audit
          </Button>
        }
      />

      <Card className="mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <FilterPills options={filterOptions} value={filter} onChange={setFilter} />
          <span className="text-[var(--font-body-sm)] text-[var(--text-secondary)]">
            {filtered.length} of {findings.length} findings
          </span>
        </div>
      </Card>

      <Card header="Findings">
        <DataTable
          data={filtered}
          emptyMessage="No findings match this filter"
          columns={[
            { key: "title", header: "Finding", sortable: true },
            {
              key: "severity",
              header: "Severity",
              render: (row) => (
                <Badge variant={severityVariant[row.severity] ?? "default"}>
                  {row.severity}
                </Badge>
              ),
            },
            { key: "category", header: "Category", sortable: true },
            { key: "sku", header: "SKU" },
            { key: "affectedCount", header: "Affected", sortable: true },
            {
              key: "savings",
              header: "Est. savings",
              sortable: true,
              render: (row) => formatCurrency(row.savings),
            },
            {
              key: "health",
              header: "Impact",
              render: (row) => (
                <TrafficLight
                  status={severityTrafficLight(row.severity)}
                  showLabel={false}
                />
              ),
            },
          ]}
        />
      </Card>
    </>
  );
}

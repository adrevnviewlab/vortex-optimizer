"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Badge,
  Card,
  DataTable,
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

  if (!findings) return <ListPageSkeleton rows={8} cols={6} />;

  return (
    <>
      <PageHeader
        title="Findings"
        breadcrumb={`Audit · ${auditId.slice(0, 8)}…`}
        actions={
          <button
            type="button"
            onClick={() => router.push(`/audits/${auditId}`)}
            className="text-[var(--font-body-sm)] text-[var(--brand-primary)] hover:underline"
          >
            ← Back to audit
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", "critical", "high", "medium", "low"] as SeverityFilter[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`rounded-[var(--button-radius)] px-3 py-1.5 text-[var(--font-body-sm)] capitalize ${
              filter === s
                ? "bg-[var(--brand-primary-muted)] text-[var(--brand-primary)]"
                : "text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)]"
            }`}
          >
            {s}
            {s !== "all" && (
              <span className="ml-1 text-[var(--text-tertiary)]">
                ({findings.filter((f) => f.severity === s).length})
              </span>
            )}
          </button>
        ))}
      </div>

      <Card>
        <DataTable
          data={filtered}
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

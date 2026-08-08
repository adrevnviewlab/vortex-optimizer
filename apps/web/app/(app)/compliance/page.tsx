"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Badge,
  Card,
  DataTable,
  formatCurrency,
  ListPageSkeleton,
  PageHeader,
  ReadinessBadge,
  StatCard,
  TrafficLight,
  type RagStatus,
} from "@vorzop/ui";
import { ShieldAlert, ShieldCheck, TriangleAlert } from "lucide-react";
import {
  DEMO_CONTOSO_AUDIT_ID,
  fetchComplianceOverview,
  type FindingItem,
} from "@/lib/api-client";

function severityRag(severity: string): RagStatus {
  if (severity === "critical" || severity === "high") return "red";
  if (severity === "medium") return "amber";
  return "green";
}

export default function CompliancePage() {
  const router = useRouter();
  const [findings, setFindings] = useState<FindingItem[] | null>(null);
  const [summary, setSummary] = useState({ red: 0, amber: 0, green: 0, savings: 0 });
  const [readiness, setReadiness] = useState<string | null>(null);

  useEffect(() => {
    fetchComplianceOverview().then((res) => {
      setFindings(res.findings);
      setSummary(res.summary);
      setReadiness(res.readiness);
    });
  }, []);

  if (!findings) return <ListPageSkeleton rows={6} cols={5} />;

  return (
    <>
      <PageHeader
        title="Compliance RAG"
        breadcrumb="Traffic-light health · Contoso Ltd"
        actions={
          readiness !== "live" ? (
            <ReadinessBadge status="amber" label="Seeded findings" />
          ) : (
            <ReadinessBadge status="green" label="Live" />
          )
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Critical / high" value={summary.red} icon={ShieldAlert} accent="var(--status-red)" />
        <StatCard label="Review needed" value={summary.amber} icon={TriangleAlert} accent="var(--status-amber)" />
        <StatCard label="Healthy signals" value={summary.green} icon={ShieldCheck} accent="var(--status-green)" />
        <StatCard
          label="Linked savings"
          value={formatCurrency(summary.savings)}
          icon={ShieldCheck}
          accent="var(--brand-primary)"
        />
      </div>

      <Card header="Compliance findings">
        <DataTable
          data={findings}
          onRowClick={() => router.push(`/audits/${DEMO_CONTOSO_AUDIT_ID}/findings`)}
          columns={[
            { key: "title", header: "Finding", sortable: true },
            { key: "category", header: "Category", sortable: true },
            {
              key: "severity",
              header: "Severity",
              render: (row) => (
                <span className="flex items-center gap-2">
                  <TrafficLight status={severityRag(row.severity)} />
                  <Badge
                    variant={
                      row.severity === "critical" || row.severity === "high"
                        ? "danger"
                        : row.severity === "medium"
                          ? "warning"
                          : "success"
                    }
                  >
                    {row.severity}
                  </Badge>
                </span>
              ),
            },
            { key: "affectedCount", header: "Affected", sortable: true },
            {
              key: "savings",
              header: "Savings",
              sortable: true,
              render: (row) => formatCurrency(row.savings),
            },
          ]}
        />
      </Card>
    </>
  );
}

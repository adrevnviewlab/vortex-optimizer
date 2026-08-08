"use client";

import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  DataTable,
  formatCurrency,
  ListPageSkeleton,
  PageHeader,
  ReadinessBadge,
  StatCard,
  useToast,
} from "@vorzop/ui";
import { Check, Clock, Globe } from "lucide-react";
import { fetchPortalFindings, type PortalFinding } from "@/lib/api-client";

export default function PortalPage() {
  const { addToast } = useToast();
  const [findings, setFindings] = useState<PortalFinding[] | null>(null);
  const [clientName, setClientName] = useState("Contoso Ltd");
  const [readiness, setReadiness] = useState<string | null>(null);

  useEffect(() => {
    fetchPortalFindings().then((res) => {
      setFindings(res.findings);
      setClientName(res.clientName);
      setReadiness(res.readiness);
    });
  }, []);

  if (!findings) return <ListPageSkeleton rows={4} cols={5} />;

  const pending = findings.filter((f) => f.status === "pending").length;
  const approved = findings.filter((f) => f.status === "approved").length;
  const savings = findings.reduce((s, f) => s + f.savings, 0);

  function setStatus(id: string, status: PortalFinding["status"]) {
    setFindings((prev) => prev?.map((f) => (f.id === id ? { ...f, status } : f)) ?? null);
    addToast({
      title: status === "approved" ? "Recommendation approved" : "Marked deferred",
      description: "Stakeholder decision recorded in the client portal.",
      variant: "success",
    });
  }

  return (
    <>
      <PageHeader
        title="Client portal"
        breadcrumb={`Read-only stakeholder view · ${clientName}`}
        actions={
          readiness !== "live" ? (
            <ReadinessBadge status="amber" label="Demo portal" />
          ) : (
            <ReadinessBadge status="green" label="Live" />
          )
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Pending approvals" value={pending} icon={Clock} accent="var(--status-amber)" />
        <StatCard label="Approved" value={approved} icon={Check} accent="var(--status-green)" />
        <StatCard
          label="Exposed savings"
          value={formatCurrency(savings)}
          icon={Globe}
          accent="var(--brand-primary)"
        />
      </div>

      <Card header="Findings for stakeholder review">
        <DataTable
          data={findings}
          columns={[
            { key: "title", header: "Recommendation", sortable: true },
            {
              key: "severity",
              header: "Severity",
              render: (row) => (
                <Badge variant={row.severity === "high" ? "danger" : "warning"}>{row.severity}</Badge>
              ),
            },
            {
              key: "savings",
              header: "Est. savings",
              sortable: true,
              render: (row) => formatCurrency(row.savings),
            },
            {
              key: "status",
              header: "Status",
              render: (row) => (
                <Badge
                  variant={
                    row.status === "approved"
                      ? "success"
                      : row.status === "deferred"
                        ? "default"
                        : "warning"
                  }
                >
                  {row.status}
                </Badge>
              ),
            },
            {
              key: "id",
              header: "Action",
              render: (row) =>
                row.status === "pending" ? (
                  <div className="flex gap-2">
                    <Button size="sm" variant="primary" onClick={() => setStatus(row.id, "approved")}>
                      Approve
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setStatus(row.id, "deferred")}>
                      Defer
                    </Button>
                  </div>
                ) : (
                  <span className="text-[var(--font-caption)] text-[var(--text-tertiary)]">—</span>
                ),
            },
          ]}
        />
      </Card>
    </>
  );
}

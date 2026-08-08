"use client";

import { useEffect, useState } from "react";
import {
  Badge,
  Card,
  ChartCard,
  DataTable,
  ListPageSkeleton,
  PageHeader,
  ReadinessBadge,
  StatCard,
} from "@vorzop/ui";
import { Activity, UserMinus, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchUtilization, type UtilizationRow } from "@/lib/api-client";

export default function UtilizationPage() {
  const [rows, setRows] = useState<UtilizationRow[] | null>(null);
  const [readiness, setReadiness] = useState<string | null>(null);

  useEffect(() => {
    fetchUtilization().then(({ rows: data, readiness: r }) => {
      setRows(data);
      setReadiness(r);
    });
  }, []);

  if (!rows) return <ListPageSkeleton rows={5} cols={6} />;

  const assigned = rows.reduce((s, r) => s + r.assigned, 0);
  const active = rows.reduce((s, r) => s + r.active30d, 0);
  const inactive = rows.reduce((s, r) => s + r.inactive, 0);
  const avgUtil = Math.round(rows.reduce((s, r) => s + r.utilizationPct, 0) / rows.length);

  return (
    <>
      <PageHeader
        title="Utilization analysis"
        breadcrumb="Sign-in & service usage · Contoso Ltd"
        actions={
          readiness !== "live" ? (
            <ReadinessBadge status="amber" label="Seeded utilization" />
          ) : null
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Assigned seats" value={assigned} icon={Users} accent="var(--brand-primary)" />
        <StatCard label="Active (30d)" value={active} icon={Activity} accent="var(--status-green)" />
        <StatCard label="Inactive" value={inactive} icon={UserMinus} accent="var(--status-amber)" />
        <StatCard label="Avg utilization" value={`${avgUtil}%`} icon={Activity} accent="var(--brand-primary)" />
      </div>

      <div className="mb-6">
        <ChartCard title="Active vs inactive by SKU">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
                <XAxis dataKey="sku" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="active30d" name="Active 30d" fill="#0067B8" radius={[2, 2, 0, 0]} />
                <Bar dataKey="inactive" name="Inactive" fill="#F59E0B" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <Card header="Utilization by SKU">
        <DataTable
          data={rows}
          columns={[
            { key: "sku", header: "SKU", sortable: true },
            { key: "assigned", header: "Assigned", sortable: true },
            { key: "active30d", header: "Active 30d", sortable: true },
            { key: "inactive", header: "Inactive", sortable: true },
            {
              key: "utilizationPct",
              header: "Utilization",
              sortable: true,
              render: (row) => (
                <Badge variant={row.utilizationPct >= 85 ? "success" : row.utilizationPct >= 70 ? "warning" : "danger"}>
                  {row.utilizationPct}%
                </Badge>
              ),
            },
            { key: "lastSignInTrend", header: "Trend" },
          ]}
        />
      </Card>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Badge,
  Card,
  ChartCard,
  computeTrafficLight,
  DataTable,
  formatCurrency,
  PageHeader,
  StatCard,
  StatCardSkeleton,
  Tabs,
  TrafficLight,
} from "@vorzop/ui";
import { Building2, ShieldCheck, TrendingDown, Users } from "lucide-react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { fetchClientDetail, type ClientDetail } from "@/lib/api-client";

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientDetail(clientId).then(({ client: data }) => {
      setClient(data);
      setLoading(false);
    });
  }, [clientId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded bg-[var(--surface-sunken)]" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <Card>
        <p className="py-8 text-center text-[var(--text-secondary)]">Client not found.</p>
      </Card>
    );
  }

  const savingsPct =
    client.monthlySpend > 0
      ? Math.round((client.potentialSavings / client.monthlySpend) * 100)
      : 0;

  return (
    <>
      <PageHeader
        title={client.name}
        breadcrumb={client.tenantId}
        actions={
          <div className="flex items-center gap-2">
            <TrafficLight status={computeTrafficLight(client.complianceScore, savingsPct)} showLabel />
            <Badge variant="brand">{client.status}</Badge>
          </div>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total licenses" value={client.totalLicenses} icon={Users} />
        <StatCard
          label="Monthly spend"
          value={formatCurrency(client.monthlySpend)}
          icon={Building2}
        />
        <StatCard
          label="Potential savings"
          value={formatCurrency(client.potentialSavings)}
          deltaTone="positive"
          icon={TrendingDown}
        />
        <StatCard
          label="Compliance score"
          value={`${client.complianceScore}%`}
          delta={client.complianceScore < 90 ? "Below target" : undefined}
          deltaTone={client.complianceScore < 90 ? "warning" : "positive"}
          icon={ShieldCheck}
        />
      </div>

      <Tabs
        tabs={[
          {
            id: "overview",
            label: "Overview",
            content: (
              <div className="grid gap-4 lg:grid-cols-2">
                <ChartCard title="License mix">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={client.licenseDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                      >
                        {client.licenseDistribution.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>
                <Card header="Client details">
                  <dl className="space-y-3 text-[var(--font-body-sm)]">
                    <div className="flex justify-between">
                      <dt className="text-[var(--text-secondary)]">Industry</dt>
                      <dd>{client.industry ?? "—"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[var(--text-secondary)]">Employees</dt>
                      <dd>{client.employeeCount ?? "—"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[var(--text-secondary)]">Region</dt>
                      <dd>{client.region}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[var(--text-secondary)]">Renewal date</dt>
                      <dd>{client.renewalDate ?? "—"}</dd>
                    </div>
                  </dl>
                </Card>
              </div>
            ),
          },
          {
            id: "audits",
            label: "Audits",
            content: (
              <Card>
                <DataTable
                  data={client.audits}
                  onRowClick={(row) => router.push(`/audits/${row.id}`)}
                  columns={[
                    { key: "date", header: "Date", sortable: true },
                    { key: "skus", header: "SKUs", sortable: true },
                    { key: "issues", header: "Issues", sortable: true },
                    {
                      key: "savings",
                      header: "Savings",
                      render: (row) => formatCurrency(row.savings),
                    },
                    {
                      key: "status",
                      header: "Status",
                      render: (row) => <Badge>{row.status}</Badge>,
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
            ),
          },
          {
            id: "reports",
            label: "Reports",
            content: (
              <div className="grid gap-4 sm:grid-cols-2">
                {client.reports.length === 0 ? (
                  <p className="text-[var(--text-secondary)]">No reports yet.</p>
                ) : (
                  client.reports.map((r) => (
                    <Card key={r.id}>
                      <h3 className="font-semibold">{r.type}</h3>
                      <p className="text-[var(--font-body-sm)] text-[var(--text-secondary)]">
                        {r.date} · {r.status}
                      </p>
                    </Card>
                  ))
                )}
              </div>
            ),
          },
          {
            id: "recommendations",
            label: "Recommendations",
            content: (
              <div className="space-y-3">
                {client.recommendations.map((rec) => (
                  <Card key={rec.id} className="hover:translate-y-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold">{rec.title}</h3>
                        <p className="text-[var(--status-green)]">
                          Est. {formatCurrency(rec.savings)}
                        </p>
                      </div>
                      <Badge
                        variant={
                          rec.status === "approved"
                            ? "success"
                            : rec.status === "rejected"
                              ? "default"
                              : "warning"
                        }
                      >
                        {rec.status}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            ),
          },
        ]}
      />
    </>
  );
}

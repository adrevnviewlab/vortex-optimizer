"use client";

import {
  Building2,
  ScanSearch,
  ShieldCheck,
  TrendingDown,
} from "lucide-react";
import {
  Badge,
  Card,
  ChartCard,
  computeTrafficLight,
  DataTable,
  formatCurrency,
  OnboardingChecklist,
  PageHeader,
  SpringActionButton,
  StatCard,
  StatCardSkeleton,
  TrafficLight,
} from "@vorzop/ui";
import {
  Cell,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchClients, fetchDashboardSummary, type DashboardSummary } from "@/lib/api-client";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [checklistDismissed, setChecklistDismissed] = useState(true);
  const [hasClients, setHasClients] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem("vorzop-onboarding-dismissed") === "true";
    setChecklistDismissed(dismissed);
    fetchDashboardSummary().then(setData);
    fetchClients().then(({ clients }) => setHasClients(clients.length > 0));
  }, []);

  const showOnboarding =
    data && (data.totalClients === 0 || !hasClients) && !checklistDismissed;

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-[var(--surface-sunken)]" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        actions={<SpringActionButton label="New Audit" onClick={() => router.push("/audits")} />}
      />

      {showOnboarding ? (
        <div className="mb-6">
          <OnboardingChecklist
            items={[
              { id: "client", label: "Add your first client", done: hasClients, href: "/clients" },
              { id: "upload", label: "Upload audit data", done: data.activeAudits > 0, href: "/audits" },
              { id: "review", label: "Review recommendations", done: false, href: "/recommendations" },
            ]}
            primaryAction={{ label: "Add client", href: "/clients" }}
            onDismiss={() => {
              localStorage.setItem("vorzop-onboarding-dismissed", "true");
              setChecklistDismissed(true);
            }}
          />
        </div>
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total clients"
              value={data.totalClients}
              delta={data.clientsDelta}
              deltaTone="positive"
              icon={Building2}
            />
            <StatCard
              label="Active audits"
              value={data.activeAudits}
              icon={ScanSearch}
            />
            <StatCard
              label="Identified savings"
              value={formatCurrency(data.identifiedSavings)}
              delta={data.savingsDelta}
              deltaTone="positive"
              icon={TrendingDown}
            />
            <StatCard
              label="Avg compliance"
              value={`${data.avgCompliance}%`}
              delta={data.avgCompliance < 90 ? "Below target" : undefined}
              deltaTone={data.avgCompliance < 90 ? "warning" : "positive"}
              icon={ShieldCheck}
            />
          </div>

          <div className="mb-6 grid gap-4 lg:grid-cols-2">
            <ChartCard title="Monthly licensing spend">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.spendTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--text-tertiary)" }} />
                  <YAxis tick={{ fontSize: 12, fill: "var(--text-tertiary)" }} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Legend />
                  <Line type="monotone" dataKey="actual" name="Actual spend" stroke="#0D9488" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="optimized" name="Optimized projection" stroke="#94A3B8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="License distribution">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.licenseDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {data.licenseDistribution.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <Card header="Recent audits">
            <DataTable
              data={data.recentAudits}
              onRowClick={(row) => {
                router.push(`/audits/${row.id}`);
              }}
              columns={[
                {
                  key: "client",
                  header: "Client",
                  width: "20%",
                  sortable: true,
                  render: (row) => (
                    <span className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--brand-primary-subtle)] text-[var(--font-caption)] font-semibold text-[var(--brand-primary)]">
                        {row.clientInitials}
                      </span>
                      {row.client}
                    </span>
                  ),
                },
                { key: "auditDate", header: "Audit date", width: "12%", sortable: true },
                { key: "skus", header: "SKUs", width: "10%", sortable: true },
                {
                  key: "issues",
                  header: "Issues",
                  width: "10%",
                  sortable: true,
                  render: (row) => (
                    <Badge variant={row.issues > 0 ? "danger" : "success"}>
                      {row.issues}
                    </Badge>
                  ),
                },
                {
                  key: "savings",
                  header: "Savings",
                  width: "15%",
                  sortable: true,
                  render: (row) => formatCurrency(row.savings),
                },
                {
                  key: "status",
                  header: "Status",
                  width: "13%",
                  render: (row) => (
                    <Badge variant={row.status === "Complete" ? "success" : row.status === "Running" ? "info" : "default"}>
                      {row.status}
                    </Badge>
                  ),
                },
                {
                  key: "health",
                  header: "Health",
                  width: "10%",
                  render: (row) => (
                    <TrafficLight
                      status={computeTrafficLight(row.complianceScore, row.savingsPercent)}
                    />
                  ),
                },
              ]}
            />
          </Card>
        </>
      )}
    </>
  );
}

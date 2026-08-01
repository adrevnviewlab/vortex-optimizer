"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Badge,
  Button,
  Card,
  computeTrafficLight,
  DataTable,
  Dialog,
  DialogContent,
  FilterPills,
  formatCurrency,
  PageHeader,
  SpringActionButton,
  TableRowSkeleton,
  TextInput,
  TrafficLight,
  useToast,
} from "@vorzop/ui";
import { createClient, fetchClients, type ClientListItem } from "@/lib/api-client";

type RegionFilter = "all" | "US" | "EU" | "UK" | "APAC";
type StatusFilter = "all" | "Active" | "Renewal" | "Prospect";

export default function ClientsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [clients, setClients] = useState<ClientListItem[] | null>(null);
  const [regionFilter, setRegionFilter] = useState<RegionFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    region: "US",
    industry: "",
    employeeCount: "",
  });

  const load = useCallback(async () => {
    const { clients: rows } = await fetchClients(undefined, { limit: 50, offset: 0 });
    setClients(rows);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!clients) return [];
    return clients.filter((c) => {
      if (regionFilter !== "all" && c.region !== regionFilter) return false;
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.tenantId.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [clients, regionFilter, statusFilter, search]);

  async function handleCreate() {
    if (!form.name.trim()) return;
    setCreating(true);
    const { client } = await createClient({
      name: form.name.trim(),
      region: form.region,
      industry: form.industry.trim() || undefined,
      employeeCount: form.employeeCount ? Number(form.employeeCount) : undefined,
    });
    setCreating(false);
    if (client) {
      addToast({ title: "Client created", description: client.name, variant: "success" });
      setDialogOpen(false);
      setForm({ name: "", region: "US", industry: "", employeeCount: "" });
      await load();
    } else {
      addToast({ title: "Could not create client", variant: "warning" });
    }
  }

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
        actions={<SpringActionButton label="New Client" onClick={() => setDialogOpen(true)} />}
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <FilterPills
          options={[
            { value: "all", label: "All regions" },
            { value: "US", label: "US" },
            { value: "EU", label: "EU" },
            { value: "UK", label: "UK" },
            { value: "APAC", label: "APAC" },
          ]}
          value={regionFilter}
          onChange={setRegionFilter}
        />
        <FilterPills
          options={[
            { value: "all", label: "All statuses" },
            { value: "Active", label: "Active" },
            { value: "Renewal", label: "Renewal" },
            { value: "Prospect", label: "Prospect" },
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
        />
        <div className="ml-auto w-full max-w-xs">
          <TextInput
            placeholder="Search clients…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <DataTable
          data={filtered}
          onRowClick={(row) => router.push(`/clients/${row.id}`)}
          emptyMessage="No clients match your filters"
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
                <Badge variant={row.status === "Renewal" ? "warning" : row.status === "Prospect" ? "info" : "success"}>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          title="New client"
          description="Add a client organization to your portfolio."
          footer={
            <>
              <Button variant="ghost" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={!form.name.trim() || creating} isLoading={creating}>
                Create client
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <TextInput
              label="Client name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Contoso Ltd"
              required
            />
            <div>
              <label className="mb-1.5 block text-[var(--font-body-sm)] font-medium text-[var(--text-secondary)]">
                Region
              </label>
              <select
                value={form.region}
                onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
                className="h-10 w-full rounded-[var(--input-radius)] border border-[var(--border-default)] bg-[var(--surface-sunken)] px-3 text-[var(--font-body-sm)] focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary-muted)]"
              >
                <option value="US">US</option>
                <option value="EU">EU</option>
                <option value="UK">UK</option>
                <option value="APAC">APAC</option>
              </select>
            </div>
            <TextInput
              label="Industry"
              value={form.industry}
              onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
              placeholder="Technology"
            />
            <TextInput
              label="Employee count"
              type="number"
              value={form.employeeCount}
              onChange={(e) => setForm((f) => ({ ...f, employeeCount: e.target.value }))}
              placeholder="500"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

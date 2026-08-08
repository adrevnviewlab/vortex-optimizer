"use client";

import { useEffect, useState } from "react";
import {
  Badge,
  Card,
  DataTable,
  formatCurrency,
  ListPageSkeleton,
  PageHeader,
  ReadinessBadge,
  StatCard,
} from "@vorzop/ui";
import { Layers, Package, TriangleAlert } from "lucide-react";
import {
  fetchLicenseInventory,
  type LicenseInventoryItem,
} from "@/lib/api-client";

const riskVariant: Record<LicenseInventoryItem["overlapRisk"], "success" | "warning" | "danger"> = {
  low: "success",
  medium: "warning",
  high: "danger",
};

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<LicenseInventoryItem[] | null>(null);
  const [readiness, setReadiness] = useState<string | null>(null);

  useEffect(() => {
    fetchLicenseInventory().then(({ licenses: rows, readiness: r }) => {
      setLicenses(rows);
      setReadiness(r);
    });
  }, []);

  if (!licenses) return <ListPageSkeleton rows={7} cols={6} />;

  const totalQty = licenses.reduce((s, l) => s + l.quantity, 0);
  const unused = licenses.reduce((s, l) => s + l.unused, 0);
  const monthly = licenses.reduce((s, l) => s + l.costMonthly, 0);

  return (
    <>
      <PageHeader
        title="License assessment"
        breadcrumb="SKU analysis · Contoso Ltd"
        actions={
          readiness && readiness !== "live" ? (
            <ReadinessBadge status="amber" label="Demo inventory" />
          ) : null
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total seats" value={totalQty} icon={Layers} accent="var(--brand-primary)" />
        <StatCard label="Unused / idle" value={unused} icon={TriangleAlert} accent="var(--status-amber)" />
        <StatCard
          label="Monthly license cost"
          value={formatCurrency(monthly)}
          icon={Package}
          accent="var(--brand-primary)"
        />
      </div>

      <Card header="Normalized SKU inventory">
        <DataTable
          data={licenses}
          columns={[
            { key: "sku", header: "SKU", sortable: true },
            { key: "productFamily", header: "Family", sortable: true },
            { key: "quantity", header: "Owned", sortable: true },
            { key: "assigned", header: "Assigned", sortable: true },
            { key: "unused", header: "Unused", sortable: true },
            {
              key: "costMonthly",
              header: "Monthly cost",
              sortable: true,
              render: (row) => formatCurrency(row.costMonthly),
            },
            {
              key: "overlapRisk",
              header: "Overlap risk",
              render: (row) => (
                <Badge variant={riskVariant[row.overlapRisk]}>{row.overlapRisk}</Badge>
              ),
            },
          ]}
        />
      </Card>
    </>
  );
}

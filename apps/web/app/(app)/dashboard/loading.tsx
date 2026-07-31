import { PageHeader, StatCardSkeleton, TableRowSkeleton } from "@vorzop/ui";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-72 animate-pulse rounded-[var(--card-radius)] bg-[var(--surface-sunken)]" />
        <div className="h-72 animate-pulse rounded-[var(--card-radius)] bg-[var(--surface-sunken)]" />
      </div>
      <TableRowSkeleton cols={6} />
      <TableRowSkeleton cols={6} />
      <TableRowSkeleton cols={6} />
    </div>
  );
}

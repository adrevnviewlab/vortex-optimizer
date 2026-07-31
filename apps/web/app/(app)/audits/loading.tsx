import { PageHeader, TableRowSkeleton } from "@vorzop/ui";

export default function AuditsLoading() {
  return (
    <div className="space-y-6">
      <PageHeader title="Audits" />
      <TableRowSkeleton cols={7} />
      <TableRowSkeleton cols={7} />
      <TableRowSkeleton cols={7} />
    </div>
  );
}

import { PageHeader, TableRowSkeleton } from "@vorzop/ui";

export default function ClientsLoading() {
  return (
    <div className="space-y-6">
      <PageHeader title="Clients" />
      <TableRowSkeleton cols={7} />
      <TableRowSkeleton cols={7} />
      <TableRowSkeleton cols={7} />
    </div>
  );
}

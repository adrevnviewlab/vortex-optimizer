"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardGridSkeleton,
  Dialog,
  DialogContent,
  PageHeader,
  SpringActionButton,
  useToast,
} from "@vorzop/ui";
import { Download, FileText, Loader2 } from "lucide-react";
import {
  DEMO_CONTOSO_AUDIT_ID,
  fetchAudits,
  fetchReportDownloadUrl,
  fetchReports,
  generateReport,
  pollReportStatus,
  type ReportListItem,
} from "@/lib/api-client";

export default function ReportsPage() {
  const { addToast } = useToast();
  const [reports, setReports] = useState<ReportListItem[] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [audits, setAudits] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedAudit, setSelectedAudit] = useState(DEMO_CONTOSO_AUDIT_ID);
  const [generating, setGenerating] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [{ reports: rows }, { audits: auditRows }] = await Promise.all([
      fetchReports(),
      fetchAudits(),
    ]);
    setReports(rows);
    setAudits(auditRows.map((a) => ({ id: a.id, label: `${a.client} · ${a.date}` })));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleGenerate() {
    setGenerating(true);
    const { reportId, readiness } = await generateReport(selectedAudit);
    if (!reportId) {
      addToast({
        title: "Report failed",
        description: readiness === "live" ? "Could not generate report" : "API unavailable — using demo data",
        variant: "warning",
      });
      setGenerating(false);
      return;
    }

    addToast({ title: "Report ready", variant: "success" });
    setDialogOpen(false);
    await load();
    setGenerating(false);

    const { downloadUrl } = await pollReportStatus(reportId);
    if (downloadUrl) {
      const { url } = await fetchReportDownloadUrl(reportId);
      if (url) window.open(url, "_blank");
    }
  }

  async function handleDownload(report: ReportListItem) {
    setDownloadingId(report.id);
    const { url } = await fetchReportDownloadUrl(report.id);
    if (url) {
      window.open(url, "_blank");
    } else if (report.downloadUrl) {
      window.open(report.downloadUrl, "_blank");
    } else {
      addToast({
        title: "Download unavailable",
        description: "Report file not found",
        variant: "warning",
      });
    }
    setDownloadingId(null);
  }

  if (!reports) return <CardGridSkeleton count={4} />;

  return (
    <>
      <PageHeader
        title="Reports"
        actions={<SpringActionButton label="Generate Report" onClick={() => setDialogOpen(true)} />}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.id} className="hover:translate-y-0">
            <div className="flex h-32 items-center justify-center rounded-lg bg-[var(--surface-sunken)]">
              <FileText size={40} className="text-[var(--text-tertiary)]" strokeWidth={1.5} />
            </div>
            <h3 className="mt-3 text-[var(--font-h3)] font-semibold">{report.client}</h3>
            <p className="text-[var(--font-body-sm)] text-[var(--text-secondary)]">
              {report.type} · {report.date}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant={report.status === "complete" ? "success" : "info"}>
                {report.status}
              </Badge>
            </div>
            <button
              type="button"
              disabled={downloadingId === report.id}
              onClick={() => handleDownload(report)}
              className="mt-3 inline-flex items-center gap-1.5 text-[var(--font-body-sm)] text-[var(--brand-primary)] hover:underline disabled:opacity-50"
            >
              {downloadingId === report.id ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}
              Download
            </button>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          title="Generate report"
          description="Select an audit and template to generate a PDF report."
          footer={
            <>
              <Button variant="ghost" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleGenerate} disabled={generating} isLoading={generating}>
                Generate
              </Button>
            </>
          }
        >
          <div>
            <label className="mb-1.5 block text-[var(--font-body-sm)] font-medium text-[var(--text-secondary)]">
              Audit
            </label>
            <select
              value={selectedAudit}
              onChange={(e) => setSelectedAudit(e.target.value)}
              className="h-10 w-full rounded-[var(--input-radius)] border border-[var(--border-default)] bg-[var(--surface-sunken)] px-3 text-[var(--font-body-sm)]"
            >
              {audits.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

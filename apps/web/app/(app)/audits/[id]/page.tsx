"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Badge,
  Button,
  Card,
  Dialog,
  DialogContent,
  FileUpload,
  formatCurrency,
  PageHeader,
  StatCard,
  StatCardSkeleton,
  useToast,
} from "@vorzop/ui";
import { Check, Loader2, ScanSearch, TrendingDown, Upload, AlertTriangle } from "lucide-react";
import {
  analyzeAudit,
  DEMO_CONTOSO_AUDIT_ID,
  fetchAuditDetail,
  importAuditCsv,
} from "@/lib/api-client";

const STEPS = [
  { id: "upload", label: "Upload" },
  { id: "processing", label: "Processing" },
  { id: "analysis", label: "Analysis" },
  { id: "complete", label: "Complete" },
];

function stepIndex(status: string, analyzing: boolean): number {
  if (analyzing) return 2;
  switch (status) {
    case "draft":
    case "consultation":
    case "data_collection":
      return 0;
    case "data_received":
    case "in_progress":
      return 1;
    case "analyzing":
      return 2;
    case "analysis_complete":
    case "completed":
    case "review":
      return 3;
    default:
      return 1;
  }
}

export default function AuditDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const auditId = (params.id as string) || DEMO_CONTOSO_AUDIT_ID;

  const [clientName, setClientName] = useState("");
  const [status, setStatus] = useState("draft");
  const [findingsCount, setFindingsCount] = useState(0);
  const [licenseCount, setLicenseCount] = useState(0);
  const [savings, setSavings] = useState(0);
  const [spend, setSpend] = useState(0);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    const { audit, clientName: name } = await fetchAuditDetail(auditId);
    if (audit) {
      setClientName(name);
      setStatus(audit.status);
      setFindingsCount(audit.findingsCount ?? 0);
      setLicenseCount(audit.licenseSnapshotCount ?? 0);
      setSavings(audit.savingsEstimate ?? 0);
      setSpend(audit.spendTotal ?? 0);
    }
    setLoading(false);
  }, [auditId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAnalyze() {
    setAnalyzing(true);
    const { ok } = await analyzeAudit(auditId);
    if (ok) {
      addToast({ title: "Analysis complete", description: "Findings updated", variant: "success" });
      await load();
      router.push(`/audits/${auditId}/findings`);
    } else {
      addToast({ title: "Analysis failed", description: "Check audit data and try again", variant: "danger" });
    }
    setAnalyzing(false);
  }

  async function handleUpload(csv: string) {
    setUploading(true);
    const { ok, rowCount } = await importAuditCsv(auditId, csv);
    setUploading(false);
    if (ok) {
      addToast({
        title: "Upload received",
        description: `${rowCount ?? 0} rows parsed`,
        variant: "success",
      });
      setUploadOpen(false);
      await load();
    } else {
      addToast({ title: "Upload failed", variant: "danger" });
    }
  }

  const currentStep = stepIndex(status, analyzing);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-[var(--surface-sunken)]" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={clientName ? `${clientName} Audit` : "Audit detail"}
        breadcrumb={`Audit · ${auditId.slice(0, 8)}…`}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setUploadOpen(true)}>
              <Upload size={16} />
              Upload CSV
            </Button>
            <Button onClick={handleAnalyze} disabled={analyzing} isLoading={analyzing}>
              {analyzing ? "Analyzing…" : "Run Analysis"}
            </Button>
          </div>
        }
      />

      <Card header="Audit progress" className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {STEPS.map((step, i) => (
            <div key={step.id} className="flex flex-1 min-w-[100px] items-center gap-2">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-[var(--font-caption)] font-semibold ${
                  i <= currentStep
                    ? "bg-[var(--brand-primary)] text-white"
                    : "bg-[var(--surface-sunken)] text-[var(--text-tertiary)]"
                }`}
              >
                {i < currentStep ? <Check size={14} /> : i + 1}
              </span>
              <span
                className={`text-[var(--font-body-sm)] ${
                  i <= currentStep ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]"
                }`}
              >
                {step.label}
              </span>
              {i < STEPS.length - 1 && (
                <div className="hidden flex-1 h-px bg-[var(--border-default)] sm:block" />
              )}
            </div>
          ))}
        </div>
        {analyzing && (
          <div className="mt-4 flex items-center gap-2 text-[var(--font-body-sm)] text-[var(--brand-primary)]">
            <Loader2 size={16} className="animate-spin" />
            Running rules engine…
          </div>
        )}
      </Card>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="SKUs scanned" value={licenseCount} icon={ScanSearch} accent="var(--trace-a)" />
        <StatCard label="Issues found" value={findingsCount} icon={AlertTriangle} accent="var(--trace-d)" />
        <StatCard label="Savings identified" value={formatCurrency(savings)} icon={TrendingDown} accent="var(--trace-c)" />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => router.push(`/audits/${auditId}/findings`)}>
          View findings
        </Button>
        <Badge variant={status.includes("complete") ? "success" : "info"}>{status}</Badge>
        {spend > 0 && (
          <span className="text-[var(--font-body-sm)] text-[var(--text-secondary)]">
            Total spend: {formatCurrency(spend)}
          </span>
        )}
      </div>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent
          title="Upload audit data"
          description="Import license CSV export from Microsoft 365 admin center."
          footer={
            <Button variant="ghost" onClick={() => setUploadOpen(false)}>
              Close
            </Button>
          }
        >
          <FileUpload onFile={handleUpload} disabled={uploading} />
        </DialogContent>
      </Dialog>
    </>
  );
}

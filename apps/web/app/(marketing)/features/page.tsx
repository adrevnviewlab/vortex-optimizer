import type { Metadata } from "next";
import {
  CloudUpload,
  FileOutput,
  Globe,
  Lightbulb,
  ScanSearch,
  ShieldCheck,
} from "lucide-react";
import { FlipCard, MarketingPrimaryLink } from "@vorzop/ui";

export const metadata: Metadata = {
  title: "Features — Vortex Optimizer",
  description:
    "Upload audits, SKU analysis, savings engine, compliance RAG, report export, and client portal for Microsoft licensing optimization.",
};

const features = [
  {
    title: "Upload audits",
    description:
      "Import CSV and Excel from M365 admin center, Azure, and SAM tools. Field mapping and validation — vendor-neutral, no reseller lock-in.",
    icon: <CloudUpload size={20} className="text-[var(--brand-primary)]" />,
  },
  {
    title: "SKU analysis",
    description:
      "Normalize Microsoft SKUs across M365, O365, Teams, Entra, Azure, EA, and CSP. Surface overlap, tier sprawl, and unused premium licenses.",
    icon: <ScanSearch size={20} className="text-[var(--brand-primary)]" />,
  },
  {
    title: "Savings engine",
    description:
      "Ranked opportunities with dollar impact and confidence scores. Typical engagements uncover 10–40% recoverable spend.",
    icon: <Lightbulb size={20} className="text-[var(--brand-primary)]" />,
  },
  {
    title: "Compliance RAG",
    description:
      "Traffic-light health signals for overspend, inactive users, and compliance risk — actionable, not alarmist.",
    icon: <ShieldCheck size={20} className="text-[var(--brand-primary)]" />,
  },
  {
    title: "Report export",
    description:
      "Executive summaries and full optimization reports as PDF. Client-ready narrative from independent advisors.",
    icon: <FileOutput size={20} className="text-[var(--brand-primary)]" />,
  },
  {
    title: "Client portal",
    description:
      "Read-only stakeholder access to review findings, approve recommendations, and track implementation progress.",
    icon: <Globe size={20} className="text-[var(--brand-primary)]" />,
  },
];

const deepDives = [
  {
    title: "From raw exports to normalized inventory",
    body: "Drop in tenant exports and contract spreadsheets. Vortex maps fields, deduplicates SKUs, and builds a single source of truth — so your team spends time advising, not cleaning data.",
    visual: "upload",
    imageFirst: true,
  },
  {
    title: "Rules engine built for Microsoft licensing",
    body: "50+ optimization patterns cover inactive users, E5 vs E3 right-sizing, Teams add-ons, Azure hybrid benefits, and EA true-ups. Every finding includes savings estimate and confidence.",
    visual: "rules",
    imageFirst: false,
  },
  {
    title: "Executive narrative clients trust",
    body: "Generate board-ready reports that explain the why behind each recommendation. Vendor-neutral language — we advise on spend, we don't resell licenses.",
    visual: "report",
    imageFirst: true,
  },
];

function DeepDiveVisual({ type }: { type: string }) {
  if (type === "upload") {
    return (
      <div className="flex h-56 flex-col justify-center gap-3 rounded-[var(--card-radius)] border border-[var(--border-default)] bg-[var(--surface-sunken)] p-6">
        <div className="rounded-lg border border-dashed border-[var(--brand-primary)] bg-[var(--brand-primary-muted)] p-4 text-center">
          <p className="text-[var(--font-body-sm)] font-medium text-[var(--brand-primary)]">Drop license export</p>
          <p className="mt-1 text-[var(--font-caption)] text-[var(--text-tertiary)]">CSV · XLSX · admin center</p>
        </div>
        <div className="space-y-2">
          {["M365 E3 × 420", "Power BI Pro × 85", "Azure P1 × 12"].map((row) => (
            <div key={row} className="rounded bg-[var(--surface-raised)] px-3 py-2 text-[var(--font-body-sm)]">
              {row}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "rules") {
    return (
      <div className="flex h-56 flex-col justify-center gap-2 rounded-[var(--card-radius)] border border-[var(--border-default)] bg-[var(--surface-sunken)] p-6">
        {[
          { label: "Inactive E5 users", savings: "$18,400", rag: "red" },
          { label: "Duplicate Teams Phone", savings: "$6,200", rag: "amber" },
          { label: "Azure RI opportunity", savings: "$12,100", rag: "green" },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-lg bg-[var(--surface-raised)] px-3 py-2"
          >
            <span className="flex items-center gap-2 text-[var(--font-body-sm)]">
              <span
                className={`h-2 w-2 rounded-full ${
                  item.rag === "red"
                    ? "bg-[var(--status-red)]"
                    : item.rag === "amber"
                      ? "bg-[var(--status-amber)]"
                      : "bg-[var(--status-green)]"
                }`}
              />
              {item.label}
            </span>
            <span className="text-[var(--font-body-sm)] font-medium text-[var(--brand-primary)]">
              {item.savings}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex h-56 flex-col rounded-[var(--card-radius)] border border-[var(--border-default)] bg-[var(--surface-raised)] p-6 shadow-[var(--shadow-sm)]">
      <p className="text-[var(--font-caption)] uppercase tracking-[var(--tracking-wide)] text-[var(--text-tertiary)]">
        Executive summary
      </p>
      <p className="mt-2 text-[var(--font-h3)] font-semibold">Contoso Ltd — Q2 optimization</p>
      <p className="mt-3 flex-1 text-[var(--font-body-sm)] text-[var(--text-secondary)]">
        23 findings · $84,200 annual savings · 18% spend reduction · independent advisory report
      </p>
      <div className="mt-4 h-2 rounded-full bg-[var(--surface-sunken)]">
        <div className="h-2 w-3/4 rounded-full bg-[var(--brand-primary)]" />
      </div>
    </div>
  );
}

export default function FeaturesPage() {
  return (
    <>
      <section className="mx-auto max-w-[var(--content-max-width)] px-4 py-16 text-center md:px-6">
        <h1
          className="font-semibold tracking-[var(--tracking-tight)]"
          style={{
            fontFamily: "var(--font-display-family)",
            fontSize: "var(--font-h1)",
          }}
        >
          Everything you need to optimize M365 licensing
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-[var(--font-body)] text-[var(--text-secondary)]">
          From data intake to executive narrative — one platform for independent licensing advisory, not
          license resale.
        </p>
      </section>

      <section className="mx-auto grid max-w-[var(--content-max-width)] grid-cols-1 gap-6 px-4 pb-20 md:grid-cols-2 md:px-6 lg:grid-cols-3">
        {features.map((f) => (
          <FlipCard key={f.title} title={f.title} description={f.description} icon={f.icon} />
        ))}
      </section>

      {deepDives.map((section) => (
        <section
          key={section.title}
          className="mx-auto grid max-w-[var(--content-max-width)] items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-6"
        >
          {section.imageFirst ? (
            <>
              <DeepDiveVisual type={section.visual} />
              <div>
                <h2 className="text-[var(--font-h2)] font-semibold">{section.title}</h2>
                <p className="mt-3 text-[var(--font-body)] leading-[var(--leading-relaxed)] text-[var(--text-secondary)]">
                  {section.body}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="md:order-1">
                <h2 className="text-[var(--font-h2)] font-semibold">{section.title}</h2>
                <p className="mt-3 text-[var(--font-body)] leading-[var(--leading-relaxed)] text-[var(--text-secondary)]">
                  {section.body}
                </p>
              </div>
              <div className="md:order-2">
                <DeepDiveVisual type={section.visual} />
              </div>
            </>
          )}
        </section>
      ))}

      <section className="mx-auto max-w-[var(--content-max-width)] px-4 pb-24 md:px-6">
        <div className="rounded-[var(--card-radius)] border border-[var(--border-default)] bg-[var(--surface-raised)] p-8 text-center shadow-[var(--shadow-sm)]">
          <h2 className="text-[var(--font-h2)] font-semibold">Ready to recover licensing spend?</h2>
          <p className="mt-2 text-[var(--font-body-sm)] text-[var(--text-secondary)]">
            See transparent USD pricing for SaaS plans and one-time audit engagements.
          </p>
          <div className="mt-6 flex justify-center">
            <MarketingPrimaryLink href="/pricing">View pricing</MarketingPrimaryLink>
          </div>
        </div>
      </section>
    </>
  );
}

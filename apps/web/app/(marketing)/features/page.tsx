import {
  CloudUpload,
  FileOutput,
  Globe,
  Lightbulb,
  ScanSearch,
  ShieldCheck,
} from "lucide-react";
import { FlipCard } from "@vorzop/ui";

const features = [
  {
    title: "Upload audits",
    description: "Import CSV and Excel license data with field mapping and validation.",
    icon: <CloudUpload size={20} className="text-[var(--brand-primary)]" />,
  },
  {
    title: "SKU analysis",
    description: "Normalize Microsoft SKUs across M365, Azure, EA, and CSP contracts.",
    icon: <ScanSearch size={20} className="text-[var(--brand-primary)]" />,
  },
  {
    title: "Savings engine",
    description: "Ranked opportunities with dollar impact and confidence scoring.",
    icon: <Lightbulb size={20} className="text-[var(--brand-primary)]" />,
  },
  {
    title: "Compliance RAG",
    description: "Traffic-light health signals for overspend and compliance risk.",
    icon: <ShieldCheck size={20} className="text-[var(--brand-primary)]" />,
  },
  {
    title: "Report export",
    description: "Executive summaries and full optimization reports as PDF.",
    icon: <FileOutput size={20} className="text-[var(--brand-primary)]" />,
  },
  {
    title: "Client portal",
    description: "Read-only access for stakeholders to review findings and approve recs.",
    icon: <Globe size={20} className="text-[var(--brand-primary)]" />,
  },
];

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
          From data intake to executive narrative — one platform for independent licensing advisory.
        </p>
      </section>

      <section className="mx-auto grid max-w-[var(--content-max-width)] grid-cols-1 gap-6 px-4 pb-16 md:grid-cols-2 md:px-6 lg:grid-cols-3">
        {features.map((f) => (
          <FlipCard key={f.title} title={f.title} description={f.description} icon={f.icon} />
        ))}
      </section>

      <section className="mx-auto max-w-[var(--content-max-width)] px-4 pb-24 md:px-6">
        <div className="rounded-[var(--card-radius)] border border-[var(--border-default)] bg-[var(--surface-raised)] p-8 text-center shadow-[var(--shadow-sm)]">
          <h2 className="text-[var(--font-h2)] font-semibold">Ready to recover licensing spend?</h2>
          <p className="mt-2 text-[var(--font-body-sm)] text-[var(--text-secondary)]">
            Start with a free audit and see savings in under 4 weeks.
          </p>
          <a
            href="/pricing"
            className="mt-6 inline-flex h-11 items-center rounded-[var(--button-radius)] bg-[var(--brand-primary)] px-6 text-[var(--font-body)] font-medium text-[var(--text-inverse)] hover:bg-[var(--brand-primary-hover)]"
          >
            View pricing
          </a>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import {
  Building2,
  CloudUpload,
  FileOutput,
  Globe,
  HeartPulse,
  Landmark,
  Lightbulb,
  ScanSearch,
  ShieldCheck,
} from "lucide-react";
import {
  FlipCard,
  MarketingCtaBand,
  MarketingPrimaryLink,
  SectionHeader,
} from "@vorzop/ui";

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

const featureDetails = [
  {
    title: "Audit intake & normalization",
    subtitle: "Upload · mapping · validation",
    bullets: [
      "CSV and Excel from M365 admin center, Azure, Entra ID",
      "Automatic SKU normalization across EA, CSP, and direct",
      "Field mapping wizard for non-standard exports",
      "Vendor-neutral — no CSP or reseller integration required",
    ],
    icon: <CloudUpload size={20} className="text-[var(--brand-primary)]" />,
  },
  {
    title: "Rules & savings engine",
    subtitle: "50+ patterns · confidence scores",
    bullets: [
      "Inactive user reclamation and E5 vs E3 right-sizing",
      "Teams add-ons, Azure hybrid benefits, EA true-up alignment",
      "Dollar impact ranked by confidence and implementation effort",
      "Typical 10–40% recoverable spend identification",
    ],
    icon: <Lightbulb size={20} className="text-[var(--brand-primary)]" />,
  },
  {
    title: "Compliance & reporting",
    subtitle: "RAG signals · executive PDF",
    bullets: [
      "Traffic-light health for overspend and compliance risk",
      "Board-ready executive summaries with savings narrative",
      "Client portal for stakeholder review and approval",
      "Independent advisory language — not license resale quotes",
    ],
    icon: <ShieldCheck size={20} className="text-[var(--brand-primary)]" />,
  },
];

const comparisonRows = [
  { label: "SKU normalization", spreadsheet: false, vortex: true },
  { label: "50+ optimization rules", spreadsheet: false, vortex: true },
  { label: "Confidence-scored findings", spreadsheet: false, vortex: true },
  { label: "Traffic-light RAG health", spreadsheet: false, vortex: true },
  { label: "Executive PDF export", spreadsheet: "Manual", vortex: "One click" },
  { label: "Client portal access", spreadsheet: false, vortex: true },
  { label: "Renewal tracking", spreadsheet: "Ad hoc", vortex: "Built-in" },
];

const industries = [
  {
    title: "Healthcare",
    description:
      "HIPAA-sensitive tenants with strict compliance requirements. Right-size E5 security SKUs, reclaim inactive clinical licenses, and align EA true-ups before renewal.",
    icon: <HeartPulse size={20} className="text-[var(--brand-primary)]" />,
  },
  {
    title: "Financial services",
    description:
      "Regulated environments with premium tier sprawl. Audit Teams Phone, Power Platform, and Azure spend alongside M365 — vendor-neutral advisory for procurement.",
    icon: <Landmark size={20} className="text-[var(--brand-primary)]" />,
  },
  {
    title: "Manufacturing",
    description:
      "Distributed workforces with mixed E3/E5 and frontline worker licenses. Identify overlap between F3, E3, and Teams Essentials across plants and offices.",
    icon: <Building2 size={20} className="text-[var(--brand-primary)]" />,
  },
  {
    title: "Professional services",
    description:
      "Project-based billing and variable headcount. Reclaim licenses from departed consultants and right-size premium add-ons between engagement cycles.",
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
      <section className="border-b border-[var(--border-default)] bg-[var(--surface-canvas)]">
        <div className="mx-auto max-w-[var(--content-max-width)] px-4 py-16 md:px-6 md:py-20 lg:px-8">
          <p className="mb-2 text-[var(--font-body-sm)] font-semibold text-[var(--brand-primary)]">
            Features
          </p>
          <h1
            className="max-w-3xl font-semibold tracking-[var(--tracking-tight)] text-[var(--text-primary)]"
            style={{ fontSize: "var(--font-display)" }}
          >
            Everything you need to optimize M365 licensing
          </h1>
          <p className="mt-4 max-w-xl text-[1.0625rem] text-[var(--text-secondary)]">
            From data intake to executive narrative — one platform for independent licensing advisory, not
            license resale.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <MarketingPrimaryLink href="/demo/launch">Try the demo</MarketingPrimaryLink>
            <a
              href="/signup"
              className="inline-flex h-11 items-center border border-[var(--text-primary)] px-6 text-[var(--font-body-sm)] font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-sunken)]"
            >
              Get started
            </a>
            <a
              href="/demo"
              className="inline-flex h-11 items-center px-4 text-[var(--font-body-sm)] font-semibold text-[var(--brand-primary)] hover:underline"
            >
              See the walkthrough
            </a>
          </div>
        </div>
      </section>

      <section className="bg-[var(--surface-sunken)] py-16 md:py-20">
        <div className="mx-auto grid max-w-[var(--content-max-width)] grid-cols-1 gap-6 px-4 md:grid-cols-2 md:px-6 lg:grid-cols-3 lg:px-8">
          {features.map((f) => (
            <FlipCard
              key={f.title}
              title={f.title}
              description={f.description}
              icon={f.icon}
              href="/demo/launch"
              hrefLabel="Explore live demo →"
            />
          ))}
        </div>
      </section>

      <section className="bg-[var(--surface-canvas)] py-16 md:py-24">
        <div className="mx-auto max-w-[var(--content-max-width)] px-4 md:px-6 lg:px-8">
          <SectionHeader
            title="Deep-dive modules"
            description="Each module includes the full workflow — not add-on upsells. Built for independent advisors running Microsoft licensing engagements."
          />
          <div className="grid gap-8 md:grid-cols-3">
            {featureDetails.map((detail) => (
              <div
                key={detail.title}
                className="border border-[var(--border-default)] bg-[var(--surface-raised)] p-6"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center bg-[var(--brand-primary-subtle)]">
                  {detail.icon}
                </div>
                <h3 className="text-[var(--font-h3)] font-semibold">{detail.title}</h3>
                <p className="mt-1 text-[var(--font-caption)] text-[var(--text-tertiary)]">{detail.subtitle}</p>
                <p className="mt-4 text-[var(--font-body-sm)] font-semibold text-[var(--text-secondary)]">
                  What&apos;s included
                </p>
                <ul className="mt-2 space-y-2">
                  {detail.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-start gap-2 text-[var(--font-body-sm)] text-[var(--text-secondary)]"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-[var(--brand-primary)]" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
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

      <section className="mx-auto max-w-[var(--content-max-width)] px-4 py-16 md:px-6">
        <SectionHeader
          title="Spreadsheet vs Vortex"
          description="Why independent advisors move beyond Excel for Microsoft licensing optimization."
        />
        <div className="overflow-x-auto rounded-[var(--card-radius)] border border-[var(--border-default)]">
          <table className="w-full min-w-[480px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--border-default)] bg-[var(--surface-sunken)]">
                <th className="px-4 py-3 text-[var(--font-body-sm)] font-semibold">Capability</th>
                <th className="px-4 py-3 text-[var(--font-body-sm)] font-semibold">Spreadsheet audit</th>
                <th className="px-4 py-3 text-[var(--font-body-sm)] font-semibold text-[var(--brand-primary)]">
                  Vortex Optimizer
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.label} className="border-b border-[var(--border-default)] last:border-0">
                  <td className="px-4 py-3 text-[var(--font-body-sm)] font-medium">{row.label}</td>
                  <td className="px-4 py-3 text-center text-[var(--font-body-sm)] text-[var(--text-secondary)]">
                    {typeof row.spreadsheet === "boolean"
                      ? row.spreadsheet
                        ? "✓"
                        : "—"
                      : row.spreadsheet}
                  </td>
                  <td className="bg-[var(--brand-primary-muted)]/30 px-4 py-3 text-center text-[var(--font-body-sm)] font-medium">
                    {typeof row.vortex === "boolean" ? (row.vortex ? "✓" : "—") : row.vortex}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-[var(--surface-sunken)] py-16 md:py-24">
        <div className="mx-auto max-w-[var(--content-max-width)] px-4 md:px-6">
          <SectionHeader
            title="Use cases by industry"
            description="Microsoft licensing complexity varies by sector. Vortex adapts rules and reporting for common vertical patterns."
          />
          <div className="grid gap-6 md:grid-cols-2">
            {industries.map((industry) => (
              <FlipCard
                key={industry.title}
                title={industry.title}
                description={industry.description}
                icon={industry.icon}
                badge="Industry"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--content-max-width)] px-4 pb-8 md:px-6 lg:px-8">
        <div className="border border-[var(--border-default)] bg-[var(--surface-raised)] p-8 text-center md:p-12">
          <h2 className="text-[var(--font-h2)] font-semibold">Ready to recover licensing spend?</h2>
          <p className="mt-2 text-[var(--font-body-sm)] text-[var(--text-secondary)]">
            See transparent USD pricing for SaaS plans and one-time audit engagements.
          </p>
          <div className="mt-6 flex justify-center">
            <MarketingPrimaryLink href="/pricing">View pricing</MarketingPrimaryLink>
          </div>
        </div>
      </section>

      <MarketingCtaBand
        title="Try it on sample data first"
        description="One-click into the Contoso Ltd workspace — seeded audits, findings, and savings. No signup required."
        primaryHref="/demo/launch"
        primaryLabel="Explore live demo"
        secondaryHref="/demo"
        secondaryLabel="See the walkthrough"
      />
    </>
  );
}

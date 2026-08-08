import type { Metadata } from "next";
import {
  Building2,
  DollarSign,
  FileCheck,
  Lightbulb,
  ShieldCheck,
  TrendingDown,
} from "lucide-react";
import {
  DashboardPreview,
  FaqTeaser,
  FlipCard,
  HeroSection,
  HowItWorksSteps,
  MarketingCtaBand,
  SectionHeader,
  TestimonialStrip,
} from "@vorzop/ui";

export const metadata: Metadata = {
  title: "Welcome — Vortex Optimizer",
  description:
    "Independent Microsoft licensing advisory. Optimize M365, Azure, and EA spend — recover 10–40% without reselling licenses.",
};

const productCards = [
  {
    title: "Savings before the renewal call",
    description:
      "See inactive users, SKU overlap, and tier sprawl before finance or procurement asks — ranked by dollar impact and confidence.",
    icon: <TrendingDown size={20} className="text-[var(--brand-primary)]" />,
    href: "/features",
    hrefLabel: "Explore savings engine",
  },
  {
    title: "One audit trail, not five spreadsheets",
    description:
      "Upload tenant exports once. Vortex normalizes SKUs, runs 50+ rules, and keeps findings auditable for client review.",
    icon: <FileCheck size={20} className="text-[var(--brand-primary)]" />,
    href: "/features",
    hrefLabel: "See audit intake",
  },
  {
    title: "Client-ready narrative",
    description:
      "Executive PDFs with vendor-neutral language — advisory reports your clients trust, not license resale quotes.",
    icon: <Lightbulb size={20} className="text-[var(--brand-primary)]" />,
    href: "/demo",
    hrefLabel: "View sample report",
  },
];

const platformModules = [
  {
    title: "License intake",
    description: "CSV and Excel from M365 admin center, Azure, Entra, and SAM tools — field mapping included.",
    icon: <Building2 size={20} className="text-[var(--brand-primary)]" />,
    href: "/features",
  },
  {
    title: "Savings engine",
    description: "Ranked opportunities with dollar estimates. Typical engagements recover 10–40% of spend.",
    icon: <DollarSign size={20} className="text-[var(--brand-primary)]" />,
    href: "/features",
  },
  {
    title: "Compliance RAG",
    description: "Traffic-light health signals for overspend, inactive users, and compliance risk.",
    icon: <ShieldCheck size={20} className="text-[var(--brand-primary)]" />,
    href: "/features",
  },
];

const howItWorksSteps = [
  {
    number: "01",
    title: "See the walkthrough",
    description: "Sample dashboard and outcomes — no signup required.",
    href: "/demo",
    hrefLabel: "Open demo →",
  },
  {
    number: "02",
    title: "Align the buyer story",
    description: "Problem → solution → product for IT and finance buyers.",
    href: "/pitch",
    hrefLabel: "View pitch →",
  },
  {
    number: "03",
    title: "Run your first audit",
    description: "Upload tenant data, review RAG findings, export executive report.",
    href: "/signup",
    hrefLabel: "Get started →",
  },
  {
    number: "04",
    title: "Scale your practice",
    description: "Invite team members, onboard clients, track renewals across portfolio.",
    href: "/pricing",
    hrefLabel: "See pricing →",
  },
];

const testimonials = [
  {
    quote:
      "We cut audit prep from two weeks to two days. Clients finally get a narrative they can take to the board.",
    author: "Sarah Chen",
    role: "Principal, Northbridge IT Advisory",
  },
  {
    quote:
      "Vendor-neutral positioning matters. Vortex helps us advise without competing with our clients' CSP relationships.",
    author: "Marcus Webb",
    role: "Director, Cloud Economics Practice",
  },
  {
    quote:
      "The RAG findings give finance teams something actionable before renewal — not another spreadsheet dump.",
    author: "Elena Rodriguez",
    role: "Microsoft Licensing Consultant",
  },
];

const faqTeaser = [
  {
    question: "Do you resell Microsoft licenses?",
    answer:
      "No. Vortex Optimizer is an independent advisory platform. We help optimize spend and compliance — we are not a CSP or license reseller.",
  },
  {
    question: "What savings should clients expect?",
    answer:
      "Typical engagements identify 10–40% recoverable spend through right-sizing, inactive user reclamation, and SKU consolidation.",
  },
  {
    question: "How is data handled?",
    answer:
      "All data is encrypted at rest and in transit. We never share client data with Microsoft, resellers, or third-party marketers.",
  },
];

export default function WelcomePage() {
  return (
    <>
      <HeroSection />

      {/* microsoft.com-style product card grid */}
      <section className="bg-[var(--surface-canvas)] py-16 md:py-20">
        <div className="mx-auto max-w-[var(--content-max-width)] px-4 md:px-6 lg:px-8">
          <SectionHeader
            title="What consultancies gain on day one"
            description="Features only matter if they change Monday morning. Here is the payoff for advisors who still run licensing audits on spreadsheets."
            align="left"
          />
          <div className="grid gap-6 md:grid-cols-3">
            {productCards.map((item) => (
              <FlipCard
                key={item.title}
                title={item.title}
                description={item.description}
                icon={item.icon}
                href={item.href}
                hrefLabel={item.hrefLabel}
              />
            ))}
          </div>
        </div>
      </section>

      <DashboardPreview />

      <section className="bg-[var(--surface-canvas)] py-16 md:py-24">
        <div className="mx-auto max-w-[var(--content-max-width)] px-4 md:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Platform modules"
            title="What your practice runs on"
            description="Operational modules independent advisors already need — wired for vendor-neutral Microsoft licensing optimization."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {platformModules.map((item) => (
              <FlipCard
                key={item.title}
                title={item.title}
                description={item.description}
                icon={item.icon}
                href={item.href}
              />
            ))}
          </div>
          <p className="mt-8 text-center">
            <a
              href="/features"
              className="text-[var(--font-body-sm)] font-semibold text-[var(--brand-primary)] hover:underline"
            >
              Full feature list →
            </a>
          </p>
        </div>
      </section>

      <div className="bg-[var(--surface-sunken)]">
        <HowItWorksSteps
          title="From first look to live practice"
          steps={howItWorksSteps}
        />
      </div>

      <TestimonialStrip testimonials={testimonials} />

      <FaqTeaser items={faqTeaser} />

      <MarketingCtaBand
        title="Ready for your next licensing audit?"
        description="Create an account for your advisory practice — or explore the demo walkthrough with seeded Contoso Ltd data."
        primaryHref="/signup"
        primaryLabel="Get started"
        secondaryHref="/demo"
        secondaryLabel="See the walkthrough"
        disclaimer="Independent Microsoft licensing advisory — not a CSP or license reseller. Not affiliated with Microsoft."
      />
    </>
  );
}

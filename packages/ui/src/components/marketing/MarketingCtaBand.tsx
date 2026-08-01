import { MarketingPrimaryLink } from "../MarketingPrimaryLink";

export interface MarketingCtaBandProps {
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  disclaimer?: string;
}

export function MarketingCtaBand({
  title,
  description,
  primaryHref = "/signup",
  primaryLabel = "Get started",
  secondaryHref,
  secondaryLabel,
  disclaimer,
}: MarketingCtaBandProps) {
  return (
    <section className="mx-auto max-w-[var(--content-max-width)] px-4 py-16 md:px-6 md:py-24">
      <div className="rounded-[var(--card-radius)] border border-[var(--border-default)] bg-[var(--surface-raised)] p-8 text-center shadow-[var(--shadow-sm)] md:p-12">
        <h2
          className="font-semibold tracking-[var(--tracking-tight)]"
          style={{ fontFamily: "var(--font-display-family)", fontSize: "var(--font-h2)" }}
        >
          {title}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-[var(--font-body)] text-[var(--text-secondary)]">
          {description}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <MarketingPrimaryLink href={primaryHref}>{primaryLabel}</MarketingPrimaryLink>
          {secondaryHref && secondaryLabel && (
            <a
              href={secondaryHref}
              className="inline-flex h-11 items-center rounded-[var(--button-radius)] border border-[var(--border-default)] px-6 text-[var(--font-body)] font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)]"
            >
              {secondaryLabel}
            </a>
          )}
        </div>
        {disclaimer && (
          <p className="mt-6 text-[var(--font-caption)] text-[var(--text-tertiary)]">{disclaimer}</p>
        )}
      </div>
    </section>
  );
}

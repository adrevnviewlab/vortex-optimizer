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

/** Full-width CTA band — microsoft.com promotional strip style. */
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
    <section className="bg-[var(--surface-sunken)] py-16 md:py-20">
      <div className="mx-auto max-w-[var(--content-inner-width)] px-4 text-center md:px-6">
        <h2
          className="font-semibold tracking-[var(--tracking-tight)] text-[var(--text-primary)]"
          style={{ fontSize: "var(--font-h2)" }}
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
              className="inline-flex h-11 items-center border border-[var(--text-primary)] px-6 text-[var(--font-body-sm)] font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-canvas)]"
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

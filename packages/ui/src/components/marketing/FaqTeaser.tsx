export interface FaqTeaserItem {
  question: string;
  answer: string;
}

export interface FaqTeaserProps {
  title?: string;
  description?: string;
  items: FaqTeaserItem[];
  ctaHref?: string;
  ctaLabel?: string;
}

export function FaqTeaser({
  title = "Common questions",
  description = "Short answers for IT and finance buyers evaluating independent licensing advisory.",
  items,
  ctaHref = "/pricing",
  ctaLabel = "See full pricing FAQ →",
}: FaqTeaserProps) {
  return (
    <section className="mx-auto max-w-[var(--content-max-width)] px-4 py-16 md:px-6 md:py-24">
      <div className="mb-8 max-w-2xl">
        <h2
          className="font-semibold tracking-[var(--tracking-tight)]"
          style={{ fontFamily: "var(--font-display-family)", fontSize: "var(--font-h2)" }}
        >
          {title}
        </h2>
        {description && (
          <p className="mt-3 text-[var(--font-body)] text-[var(--text-secondary)]">{description}</p>
        )}
      </div>
      <div className="mx-auto max-w-2xl space-y-4">
        {items.map((item) => (
          <details
            key={item.question}
            className="rounded-[var(--card-radius)] border border-[var(--border-default)] bg-[var(--surface-raised)] p-4"
          >
            <summary className="cursor-pointer text-[var(--font-body-sm)] font-semibold">
              {item.question}
            </summary>
            <p className="mt-2 text-[var(--font-body-sm)] text-[var(--text-secondary)]">{item.answer}</p>
          </details>
        ))}
      </div>
      {ctaHref && (
        <p className="mt-8 text-center">
          <a
            href={ctaHref}
            className="text-[var(--font-body-sm)] font-medium text-[var(--brand-primary)] hover:underline"
          >
            {ctaLabel}
          </a>
        </p>
      )}
    </section>
  );
}

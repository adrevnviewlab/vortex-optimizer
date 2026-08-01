export interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

export interface TestimonialStripProps {
  title?: string;
  testimonials: Testimonial[];
}

export function TestimonialStrip({
  title = "Trusted by independent licensing advisors",
  testimonials,
}: TestimonialStripProps) {
  return (
    <section className="border-y border-[var(--border-default)] bg-[var(--surface-sunken)] py-12 md:py-16">
      <div className="mx-auto max-w-[var(--content-max-width)] px-4 md:px-6">
        <p className="mb-8 text-center text-[var(--font-caption)] font-medium uppercase tracking-[var(--tracking-wide)] text-[var(--text-tertiary)]">
          {title}
        </p>
        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((t) => (
            <blockquote key={t.author} className="text-center md:text-left">
              <p className="text-[var(--font-body)] leading-[var(--leading-relaxed)] text-[var(--text-secondary)]">
                &ldquo;{t.quote}&rdquo;
              </p>
              <footer className="mt-4">
                <p className="text-[var(--font-body-sm)] font-semibold">{t.author}</p>
                <p className="text-[var(--font-caption)] text-[var(--text-tertiary)]">{t.role}</p>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Card } from "../Card";

export interface HowItWorksStep {
  number: string;
  title: string;
  description: string;
  href?: string;
  hrefLabel?: string;
}

export interface HowItWorksStepsProps {
  title: string;
  description?: string;
  steps: HowItWorksStep[];
}

export function HowItWorksSteps({ title, description, steps }: HowItWorksStepsProps) {
  return (
    <section className="mx-auto max-w-[var(--content-max-width)] px-4 py-16 md:px-6 md:py-24">
      <div className="mb-10 max-w-2xl">
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step) => (
          <Card key={step.number} className="hover:translate-y-0">
            <p className="text-[var(--font-caption)] font-semibold text-[var(--brand-primary)]">
              {step.number}
            </p>
            <h3 className="mt-2 text-[var(--font-h3)] font-semibold">{step.title}</h3>
            <p className="mt-2 text-[var(--font-body-sm)] text-[var(--text-secondary)]">
              {step.description}
            </p>
            {step.href && (
              <a
                href={step.href}
                className="mt-4 inline-block text-[var(--font-body-sm)] font-medium text-[var(--brand-primary)] hover:underline"
              >
                {step.hrefLabel ?? "Learn more →"}
              </a>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
}

export interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
}: SectionHeaderProps) {
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";

  return (
    <div className={`mb-10 max-w-2xl ${alignClass}`}>
      {eyebrow && (
        <p className="mb-2 text-[var(--font-caption)] font-medium uppercase tracking-[var(--tracking-wide)] text-[var(--brand-primary)]">
          {eyebrow}
        </p>
      )}
      <h2
        className="font-semibold tracking-[var(--tracking-tight)]"
        style={{ fontFamily: "var(--font-display-family)", fontSize: "var(--font-h2)" }}
      >
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-[var(--font-body)] leading-[var(--leading-relaxed)] text-[var(--text-secondary)]">
          {description}
        </p>
      )}
    </div>
  );
}

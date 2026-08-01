"use client";

import { BrandLogo } from "./BrandLogo";

export interface MarketingNavProps {
  currentPath?: string;
}

/** Pitch and demo stay off header nav (rule §3.22). */
const navLinks = [
  { href: "/welcome", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
];

const regions = [
  { value: "US", label: "United States" },
  { value: "EU", label: "European Union" },
  { value: "UK", label: "United Kingdom" },
];

export function MarketingNav({ currentPath }: MarketingNavProps) {
  return (
    <header
      className="sticky top-0 z-30 border-b border-[var(--border-default)] bg-[var(--surface-canvas)]/80 backdrop-blur-xl"
      aria-label="Marketing"
    >
      <div className="mx-auto flex h-[var(--header-height)] max-w-[var(--content-max-width)] items-center justify-between gap-4 px-4 md:px-6">
        <BrandLogo size="md" href="/welcome" />

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={
                currentPath === link.href
                  ? "text-[var(--font-body-sm)] font-medium text-[var(--brand-primary)]"
                  : "text-[var(--font-body-sm)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <select
            aria-label="Operating region"
            defaultValue="US"
            className="hidden h-8 max-w-[9rem] truncate rounded-[var(--button-radius)] border border-[var(--border-default)] bg-[var(--surface-raised)] px-2 text-[var(--font-body-sm)] text-[var(--text-secondary)] md:block"
          >
            {regions.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <select
            aria-label="Language"
            defaultValue="en"
            className="hidden h-8 rounded-[var(--button-radius)] border border-[var(--border-default)] bg-[var(--surface-raised)] px-2 text-[var(--font-body-sm)] text-[var(--text-secondary)] md:block"
          >
            <option value="en">English</option>
          </select>
          <a
            href="/signup"
            className="inline-flex h-8 items-center rounded-[var(--button-radius)] border border-[var(--border-default)] px-3 text-[var(--font-body-sm)] font-medium text-[var(--text-primary)] hover:bg-[var(--surface-sunken)]"
          >
            Get started
          </a>
          <a
            href="/login"
            className="inline-flex h-8 items-center rounded-[var(--button-radius)] bg-[var(--brand-primary)] px-3.5 text-[var(--font-body-sm)] font-medium text-[var(--text-inverse)] hover:bg-[var(--brand-primary-hover)]"
          >
            Sign in
          </a>
        </div>
      </div>
    </header>
  );
}

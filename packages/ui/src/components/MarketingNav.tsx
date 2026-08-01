"use client";

import { BrandLogo } from "./BrandLogo";

export interface MarketingNavProps {
  currentPath?: string;
}

const navLinks = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
];

export function MarketingNav({ currentPath }: MarketingNavProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border-default)] bg-[var(--surface-canvas)]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[var(--content-max-width)] items-center justify-between px-4 md:px-6">
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
          <a
            href="/login"
            className="inline-flex h-8 items-center rounded-[var(--button-radius)] px-3 text-[var(--font-body-sm)] font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)]"
          >
            Sign In
          </a>
          <a
            href="/signup"
            className="inline-flex h-8 items-center rounded-[var(--button-radius)] bg-[var(--brand-primary)] px-3 text-[var(--font-body-sm)] font-medium text-[var(--text-inverse)] hover:bg-[var(--brand-primary-hover)]"
          >
            Get Started
          </a>
        </div>
      </div>
    </header>
  );
}

"use client";

import { useState } from "react";
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

export function MarketingNav({ currentPath }: MarketingNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-30 border-b border-[var(--border-default)] bg-[var(--surface-canvas)]"
      aria-label="Marketing"
    >
      <div className="mx-auto flex h-[var(--header-height)] max-w-[var(--content-max-width)] items-center gap-4 px-4 md:px-6 lg:px-8">
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center text-[var(--text-primary)] md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((o) => !o)}
        >
          <span className="sr-only">Menu</span>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            {mobileOpen ? (
              <path d="M4 4L14 14M14 4L4 14" stroke="currentColor" strokeWidth="1.5" />
            ) : (
              <path d="M2 5H16M2 9H16M2 13H16" stroke="currentColor" strokeWidth="1.5" />
            )}
          </svg>
        </button>

        <BrandLogo size="md" href="/welcome" />

        <nav className="ml-4 hidden items-stretch gap-0 md:flex" aria-label="Primary">
          {navLinks.map((link) => {
            const active = currentPath === link.href;
            return (
              <a
                key={link.href}
                href={link.href}
                className={
                  active
                    ? "relative flex items-center px-3 text-[var(--font-body-sm)] font-semibold text-[var(--text-primary)] after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-[var(--brand-primary)]"
                    : "flex items-center px-3 text-[var(--font-body-sm)] text-[var(--text-primary)] hover:underline"
                }
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {searchOpen ? (
            <form
              role="search"
              className="hidden items-center border border-[var(--border-strong)] sm:flex"
              onSubmit={(e) => {
                e.preventDefault();
                setSearchOpen(false);
              }}
            >
              <input
                type="search"
                name="q"
                placeholder="Search Vortex"
                autoFocus
                aria-label="Search"
                className="h-9 w-44 bg-transparent px-3 text-[var(--font-body-sm)] outline-none md:w-56"
              />
              <button
                type="button"
                className="h-9 px-2 text-[var(--font-body-sm)] text-[var(--text-secondary)]"
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
              >
                Esc
              </button>
            </form>
          ) : (
            <button
              type="button"
              className="hidden h-9 w-9 items-center justify-center text-[var(--text-primary)] hover:bg-[var(--surface-sunken)] sm:inline-flex"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          )}

          <a
            href="/signup"
            className="hidden min-h-10 items-center px-3 text-[var(--font-body-sm)] font-semibold text-[var(--text-primary)] hover:underline sm:inline-flex"
          >
            Get started
          </a>
          <a
            href="/login"
            className="vo-primary-cta inline-flex min-h-10 items-center bg-[var(--brand-primary)] px-5 py-2 text-[var(--font-body-sm)] font-semibold text-white hover:bg-[var(--brand-primary-hover)] hover:text-white"
          >
            Sign in
          </a>
        </div>
      </div>

      {mobileOpen && (
        <nav
          className="border-t border-[var(--border-default)] bg-[var(--surface-canvas)] px-4 py-3 md:hidden"
          aria-label="Mobile"
        >
          <ul className="space-y-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="block py-2 text-[var(--font-body)] text-[var(--text-primary)] hover:underline"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a href="/signup" className="block py-2 text-[var(--font-body)] text-[var(--text-primary)] hover:underline">
                Get started
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}

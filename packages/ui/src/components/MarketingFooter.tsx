export function MarketingFooter() {
  return (
    <footer className="border-t border-[var(--border-default)] bg-[var(--surface-canvas)]">
      <div className="mx-auto max-w-[var(--content-max-width)] px-4 py-12 md:px-6">
        <p className="max-w-xl text-[var(--font-body-sm)] text-[var(--text-secondary)]">
          Independent Microsoft licensing advisory platform — M365, Azure, and EA optimization.
          Vendor-neutral guidance for operators, not a CSP or license reseller.
        </p>
        <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
          <li>
            <a href="/welcome" className="text-[var(--font-body-sm)] text-[var(--text-secondary)] hover:text-[var(--brand-primary)]">
              Home
            </a>
          </li>
          <li>
            <a href="/features" className="text-[var(--font-body-sm)] text-[var(--text-secondary)] hover:text-[var(--brand-primary)]">
              Features
            </a>
          </li>
          <li>
            <a href="/pricing" className="text-[var(--font-body-sm)] text-[var(--text-secondary)] hover:text-[var(--brand-primary)]">
              Pricing
            </a>
          </li>
          <li>
            <a href="/demo" className="text-[var(--font-body-sm)] text-[var(--text-secondary)] hover:text-[var(--brand-primary)]">
              Contact
            </a>
          </li>
          <li>
            <a href="/signup" className="text-[var(--font-body-sm)] text-[var(--text-secondary)] hover:text-[var(--brand-primary)]">
              Get started
            </a>
          </li>
        </ul>
        <p className="mt-8 text-[var(--font-caption)] text-[var(--text-tertiary)]">
          © {new Date().getFullYear()} Vortex Optimizer · Independent advisory — not legal or compliance advice.
        </p>
      </div>
    </footer>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-[var(--border-default)] bg-[var(--surface-canvas)]">
      <div className="mx-auto max-w-[var(--content-max-width)] px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <p className="text-[var(--font-body-sm)] font-semibold">Product</p>
            <ul className="mt-3 space-y-2">
              <li><a href="/features" className="text-[var(--font-body-sm)] text-[var(--text-secondary)] hover:text-[var(--brand-primary)]">Features</a></li>
              <li><a href="/pricing" className="text-[var(--font-body-sm)] text-[var(--text-secondary)] hover:text-[var(--brand-primary)]">Pricing</a></li>
            </ul>
          </div>
          <div>
            <p className="text-[var(--font-body-sm)] font-semibold">Company</p>
            <ul className="mt-3 space-y-2">
              <li><a href="/welcome" className="text-[var(--font-body-sm)] text-[var(--text-secondary)] hover:text-[var(--brand-primary)]">About</a></li>
            </ul>
          </div>
          <div>
            <p className="text-[var(--font-body-sm)] font-semibold">Legal</p>
            <ul className="mt-3 space-y-2">
              <li><span className="text-[var(--font-body-sm)] text-[var(--text-secondary)]">Privacy Policy</span></li>
              <li><span className="text-[var(--font-body-sm)] text-[var(--text-secondary)]">Terms of Service</span></li>
            </ul>
          </div>
          <div>
            <p className="text-[var(--font-body-sm)] text-[var(--text-secondary)]">
              Built for Microsoft 365 licensing optimization. Independent advisor — not a reseller.
            </p>
          </div>
        </div>
        <p className="mt-8 text-[var(--font-caption)] text-[var(--text-tertiary)]">
          © {new Date().getFullYear()} Vortex Optimizer. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

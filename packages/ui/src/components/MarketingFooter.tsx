export function MarketingFooter() {
  const year = new Date().getFullYear();

  const columns = [
    {
      title: "Product",
      links: [
        { href: "/welcome", label: "Home" },
        { href: "/features", label: "Features" },
        { href: "/pricing", label: "Pricing" },
        { href: "/signup", label: "Get started" },
      ],
    },
    {
      title: "Resources",
      links: [
        { href: "/demo/launch", label: "Try the live demo" },
        { href: "/demo", label: "Demo walkthrough" },
        { href: "/pitch", label: "Buyer pitch" },
        { href: "/features", label: "How it works" },
      ],
    },
    {
      title: "Practice",
      links: [
        { href: "/login", label: "Sign in" },
        { href: "/signup", label: "Create account" },
        { href: "/pricing", label: "Contact sales" },
      ],
    },
    {
      title: "About",
      links: [
        { href: "/welcome", label: "Independent advisory" },
        { href: "/features", label: "Vendor-neutral approach" },
        { href: "/pricing", label: "Partner pricing" },
      ],
    },
  ];

  return (
    <footer className="bg-[var(--surface-footer)] text-[var(--text-footer)]">
      <div className="mx-auto max-w-[var(--content-max-width)] px-4 py-12 md:px-6 md:py-16 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 text-[var(--font-body-sm)] font-semibold text-white">
                {col.title}
              </h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={`${col.title}-${link.label}`}>
                    <a
                      href={link.href}
                      className="text-[var(--font-body-sm)] text-[var(--text-footer)] hover:underline"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-white/15 pt-8">
          <p className="max-w-3xl text-[var(--font-body-sm)] text-[var(--text-footer)]">
            Independent Microsoft licensing advisory platform — M365, Azure, and EA optimization.
            Vendor-neutral guidance for operators. Vortex Optimizer is not affiliated with, endorsed by,
            or a partner of Microsoft Corporation. Not a CSP or license reseller.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[var(--font-caption)] text-[var(--text-footer)]">
            <span>© {year} Vortex Optimizer</span>
            <a href="/welcome" className="hover:underline">
              Privacy
            </a>
            <a href="/welcome" className="hover:underline">
              Terms
            </a>
            <span>Not legal or compliance advice</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

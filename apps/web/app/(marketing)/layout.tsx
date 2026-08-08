"use client";

import { usePathname } from "next/navigation";
import { MarketingFooter, MarketingNav } from "@vorzop/ui";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--surface-canvas)]">
      <MarketingNav currentPath={pathname ?? undefined} />
      <main>{children}</main>
      <MarketingFooter />
    </div>
  );
}

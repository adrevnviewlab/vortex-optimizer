"use client";

import { AppShell } from "@vorzop/ui";
import { usePathname } from "next/navigation";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AppShell currentPath={pathname} showAdmin>
      {children}
    </AppShell>
  );
}

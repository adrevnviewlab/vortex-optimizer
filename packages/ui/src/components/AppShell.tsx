"use client";

import { useState, type ReactNode } from "react";
import { PartnerDisclaimer, RegionLabel } from "@vorzop/ui";
import { cn } from "../lib/cn";
import { FloatingDock } from "./FloatingDock";
import { HeaderBar } from "./HeaderBar";
import { SideNav, useSideNavCollapse } from "./SideNav";

export interface AppShellProps {
  children: ReactNode;
  currentPath?: string;
  showAdmin?: boolean;
}

export function AppShell({
  children,
  currentPath = "/dashboard",
  showAdmin = true,
}: AppShellProps) {
  const { collapsed, toggle } = useSideNavCollapse();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--surface-canvas)]">
      <HeaderBar
        onMenuClick={() => setMobileOpen(true)}
        onToggleSidebar={toggle}
      />

      <div className="flex">
        <SideNav
          collapsed={collapsed}
          onToggle={toggle}
          currentPath={currentPath}
          showAdmin={showAdmin}
        />

        {/* Mobile drawer */}
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-[var(--surface-overlay)] md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <aside
              className={cn(
                "fixed inset-y-0 left-0 z-50 flex w-[var(--sidenav-width)] flex-col bg-[var(--surface-raised)]",
                "border-r border-[var(--border-default)] pt-[env(safe-area-inset-top)] md:hidden"
              )}
            >
              <SideNav
                variant="drawer"
                collapsed={false}
                onToggle={() => setMobileOpen(false)}
                currentPath={currentPath}
                showAdmin={showAdmin}
                onNavigate={() => setMobileOpen(false)}
              />
            </aside>
          </>
        )}

        <main className="min-h-[calc(100vh-var(--header-height))] flex-1 overflow-x-hidden pb-20">
          <div className="mx-auto max-w-[var(--content-max-width)] p-4 md:p-6">
            <div className="mb-4 flex items-center justify-end">
              <RegionLabel
                region="US"
                className="rounded-full border border-[var(--border-default)] bg-[var(--surface-raised)] px-3 py-1 text-[var(--font-caption)] text-[var(--text-secondary)]"
              />
            </div>
            {children}
            <PartnerDisclaimer />
          </div>
        </main>
      </div>

      <FloatingDock currentPath={currentPath} />
    </div>
  );
}

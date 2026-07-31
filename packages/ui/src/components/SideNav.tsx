"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  CalendarDays,
  ChevronLeft,
  FileText,
  LayoutDashboard,
  Lightbulb,
  ScanSearch,
  Settings,
  Shield,
} from "lucide-react";
import { cn, springConfig } from "../lib/cn";
import { BrandLogo } from "./BrandLogo";
import { Tooltip } from "./Tooltip";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  adminOnly?: boolean;
}

const defaultNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Clients", href: "/clients", icon: Building2 },
  { label: "Audits", href: "/audits", icon: ScanSearch },
  { label: "Renewals", href: "/renewals", icon: CalendarDays },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Recommendations", href: "/recommendations", icon: Lightbulb },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Admin", href: "/admin", icon: Shield, adminOnly: true },
];

export interface SideNavProps {
  collapsed: boolean;
  onToggle: () => void;
  currentPath: string;
  showAdmin?: boolean;
  onNavigate?: (href: string) => void;
  variant?: "sidebar" | "drawer";
}

function NavLinks({
  items,
  collapsed,
  currentPath,
  onNavigate,
}: {
  items: NavItem[];
  collapsed: boolean;
  currentPath: string;
  onNavigate?: (href: string) => void;
}) {
  return (
    <>
      {items.map((item) => {
        const active = currentPath === item.href || currentPath.startsWith(`${item.href}/`);
        const Icon = item.icon;

        const link = (
          <a
            key={item.href}
            href={item.href}
            onClick={(e) => {
              if (onNavigate) {
                e.preventDefault();
                onNavigate(item.href);
              }
            }}
            className={cn(
              "relative flex items-center gap-3 rounded-[var(--button-radius)] px-3 py-2.5",
              "text-[var(--font-body-sm)] font-medium transition-colors",
              active
                ? "bg-[var(--brand-primary-muted)] text-[var(--brand-primary)]"
                : "text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)] hover:text-[var(--text-primary)]",
              collapsed && "justify-center px-2"
            )}
          >
            {active && (
              <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-[var(--brand-primary)]" />
            )}
            <Icon size={18} />
            {!collapsed && <span>{item.label}</span>}
          </a>
        );

        return collapsed ? (
          <Tooltip key={item.href} content={item.label} side="right">
            {link}
          </Tooltip>
        ) : (
          link
        );
      })}
    </>
  );
}

export function SideNav({
  collapsed,
  onToggle,
  currentPath,
  showAdmin = true,
  onNavigate,
  variant = "sidebar",
}: SideNavProps) {
  const items = defaultNavItems.filter((item) => !item.adminOnly || showAdmin);

  if (variant === "drawer") {
    return (
      <nav className="flex-1 space-y-0.5 px-2 pt-4">
        <div className="mb-4 px-3">
          <BrandLogo size="md" href="/dashboard" />
        </div>
        <NavLinks items={items} collapsed={false} currentPath={currentPath} onNavigate={onNavigate} />
      </nav>
    );
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? "var(--sidenav-collapsed)" : "var(--sidenav-width)" }}
      transition={springConfig}
      className={cn(
        "hidden md:flex shrink-0 flex-col border-r border-[var(--border-default)]",
        "bg-[var(--surface-raised)] h-[calc(100vh-var(--header-height))]"
      )}
    >
      <div className={cn("flex items-center px-3 py-4", collapsed ? "justify-center" : "gap-2")}>
        {collapsed ? (
          <BrandLogo size="sm" showWordmark={false} href="/dashboard" />
        ) : (
          <BrandLogo size="md" href="/dashboard" />
        )}
      </div>

      <nav className="flex-1 space-y-0.5 px-2">
        <NavLinks items={items} collapsed={collapsed} currentPath={currentPath} onNavigate={onNavigate} />
      </nav>

      <div className="border-t border-[var(--border-default)] p-2">
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "flex w-full items-center gap-2 rounded-[var(--button-radius)] px-3 py-2",
            "text-[var(--text-tertiary)] hover:bg-[var(--surface-sunken)] hover:text-[var(--text-primary)]"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            size={16}
            className={cn("transition-transform", collapsed && "rotate-180")}
          />
          {!collapsed && <span className="text-[var(--font-body-sm)]">Collapse</span>}
        </button>
      </div>
    </motion.aside>
  );
}

export function useSideNavCollapse() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("vorzop-sidenav-collapsed");
    if (stored !== null) setCollapsed(stored === "true");
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("vorzop-sidenav-collapsed", String(next));
      return next;
    });
  };

  return { collapsed, toggle, setCollapsed };
}

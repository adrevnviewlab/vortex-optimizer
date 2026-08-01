"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  CalendarDays,
  FileText,
  LayoutDashboard,
  Lightbulb,
  ScanSearch,
  Settings,
  Shield,
} from "lucide-react";
import { cn, springConfig } from "../lib/cn";

const dockItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Clients", href: "/clients", icon: Building2 },
  { label: "Audits", href: "/audits", icon: ScanSearch },
  { label: "Renewals", href: "/renewals", icon: CalendarDays },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Recommendations", href: "/recommendations", icon: Lightbulb },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Admin", href: "/admin", icon: Shield },
];

export interface FloatingDockProps {
  currentPath?: string;
  showAdmin?: boolean;
  /** When true, sidenav is collapsed — dock centers in the remaining content band. */
  sidenavCollapsed?: boolean;
}

export function FloatingDock({
  currentPath = "/dashboard",
  showAdmin = true,
  sidenavCollapsed = false,
}: FloatingDockProps) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 768) return;
      const nearBottom = window.innerHeight - e.clientY < 80;
      setVisible(nearBottom);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const items = dockItems.filter((item) => item.href !== "/admin" || showAdmin);
  const show = isMobile || visible;
  const sidenavOffset = sidenavCollapsed
    ? "var(--sidenav-collapsed)"
    : "var(--sidenav-width)";

  return (
    <motion.nav
      initial={false}
      animate={{
        opacity: show ? 1 : 0,
        y: show ? 0 : 16,
        scale: show && hovered && !isMobile ? 1.06 : 1,
      }}
      transition={springConfig}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={
        isMobile
          ? undefined
          : {
              /* Center within content band so the dock never sits under the sidenav */
              left: `calc(${sidenavOffset} + (100vw - ${sidenavOffset}) / 2)`,
            }
      }
      className={cn(
        "fixed bottom-4 z-40 -translate-x-1/2",
        isMobile && "left-1/2",
        "flex items-center gap-0.5 rounded-2xl px-2 py-1.5 md:gap-1 md:px-3 md:py-2",
        "border border-[var(--surface-dock-border)] bg-[var(--surface-dock)] shadow-[var(--shadow-dock)]",
        "backdrop-blur-[20px]",
        "pb-[max(0.5rem,env(safe-area-inset-bottom))]",
        !show && !isMobile && "pointer-events-none"
      )}
      aria-label="Quick navigation"
    >
      {items.map((item, i) => {
        const active =
          currentPath === item.href || currentPath.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <motion.a
            key={item.href}
            href={item.href}
            whileHover={isMobile ? undefined : { scale: 1.22, y: -4 }}
            transition={{ ...springConfig, delay: i * 0.02 }}
            className={cn(
              "relative flex h-10 w-10 items-center justify-center rounded-xl md:h-12 md:w-12",
              "text-[var(--text-secondary)] hover:text-[var(--brand-primary)]",
              active && "text-[var(--brand-primary)]"
            )}
            aria-label={item.label}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 2} />
            {active && (
              <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-[var(--brand-primary)]" />
            )}
          </motion.a>
        );
      })}
    </motion.nav>
  );
}

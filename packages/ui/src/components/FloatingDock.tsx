"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  FileText,
  LayoutDashboard,
  ScanSearch,
  Settings,
} from "lucide-react";
import { cn, springConfig } from "../lib/cn";

const dockItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Clients", href: "/clients", icon: Building2 },
  { label: "Audits", href: "/audits", icon: ScanSearch },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Settings", href: "/settings", icon: Settings },
];

export interface FloatingDockProps {
  currentPath?: string;
}

export function FloatingDock({ currentPath = "/dashboard" }: FloatingDockProps) {
  const [visible, setVisible] = useState(false);
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

  const show = isMobile || visible;

  return (
    <motion.nav
      initial={false}
      animate={{
        opacity: show ? 1 : 0,
        y: show ? 0 : 16,
      }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "fixed bottom-4 left-1/2 z-40 -translate-x-1/2",
        "flex items-center gap-1 rounded-2xl px-3 py-2",
        "border border-[var(--surface-dock-border)] bg-[var(--surface-dock)] shadow-[var(--shadow-dock)]",
        "backdrop-blur-[20px]",
        "pb-[max(0.5rem,env(safe-area-inset-bottom))]",
        !show && !isMobile && "pointer-events-none"
      )}
      aria-label="Quick navigation"
    >
      {dockItems.map((item, i) => {
        const active = currentPath === item.href || currentPath.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <motion.a
            key={item.href}
            href={item.href}
            whileHover={isMobile ? undefined : { scale: 1.18 }}
            transition={{ ...springConfig, delay: i * 0.03 }}
            className={cn(
              "relative flex h-12 w-12 items-center justify-center rounded-xl",
              "text-[var(--text-secondary)] hover:text-[var(--brand-primary)]",
              active && "text-[var(--brand-primary)]"
            )}
            aria-label={item.label}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 2} />
            {active && (
              <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-[var(--brand-primary)]" />
            )}
          </motion.a>
        );
      })}
    </motion.nav>
  );
}

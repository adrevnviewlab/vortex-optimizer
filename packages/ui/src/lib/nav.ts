import type { ComponentType } from "react";
import {
  Activity,
  Building2,
  CalendarDays,
  FileText,
  Globe,
  Layers,
  LayoutDashboard,
  Lightbulb,
  Map,
  MessageSquare,
  ScanSearch,
  Settings,
  Shield,
  ShieldCheck,
} from "lucide-react";

export interface AppNavItem {
  label: string;
  href: string;
  icon: ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  adminOnly?: boolean;
  /** Prefer showing in FloatingDock (primary ops). */
  dock?: boolean;
}

/** Full in-app module navigation — Features page + PRD modules. */
export const APP_NAV_ITEMS: AppNavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, dock: true },
  { label: "Clients", href: "/clients", icon: Building2, dock: true },
  { label: "Audits", href: "/audits", icon: ScanSearch, dock: true },
  { label: "Licenses", href: "/licenses", icon: Layers, dock: true },
  { label: "Utilization", href: "/utilization", icon: Activity, dock: true },
  { label: "Compliance", href: "/compliance", icon: ShieldCheck },
  { label: "Recommendations", href: "/recommendations", icon: Lightbulb, dock: true },
  { label: "Roadmap", href: "/roadmap", icon: Map },
  { label: "Renewals", href: "/renewals", icon: CalendarDays, dock: true },
  { label: "Reports", href: "/reports", icon: FileText, dock: true },
  { label: "Advisory", href: "/advisory", icon: MessageSquare },
  { label: "Portal", href: "/portal", icon: Globe },
  { label: "Settings", href: "/settings", icon: Settings, dock: true },
  { label: "Admin", href: "/admin", icon: Shield, adminOnly: true },
];

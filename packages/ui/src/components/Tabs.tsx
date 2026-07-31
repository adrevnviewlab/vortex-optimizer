"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn, springConfig } from "../lib/cn";

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  className?: string;
}

export function Tabs({ tabs, defaultTab, className }: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id ?? "");

  const activeTab = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label="Sections"
        className="relative flex gap-1 border-b border-[var(--border-default)]"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => setActive(tab.id)}
              className={cn(
                "relative px-4 py-2.5 text-[var(--font-body-sm)] font-medium transition-colors",
                isActive
                  ? "text-[var(--brand-primary)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
              )}
            >
              {tab.label}
              {isActive && (
                <motion.span
                  layoutId="tab-underline"
                  className="absolute inset-x-0 -bottom-px h-0.5 bg-[var(--brand-primary)]"
                  transition={springConfig}
                />
              )}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`tabpanel-${activeTab?.id}`}
        aria-labelledby={`tab-${activeTab?.id}`}
        className="pt-6"
      >
        {activeTab?.content}
      </div>
    </div>
  );
}

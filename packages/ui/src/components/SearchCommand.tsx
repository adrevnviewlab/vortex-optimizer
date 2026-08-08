"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { cn, springConfig } from "../lib/cn";

export interface SearchResult {
  id: string;
  label: string;
  group: string;
  href: string;
}

export interface SearchCommandProps {
  results?: SearchResult[];
  onSelect?: (result: SearchResult) => void;
}

const defaultResults: SearchResult[] = [
  { id: "1", label: "Contoso Ltd", group: "Clients", href: "/clients" },
  { id: "2", label: "Fabrikam Inc", group: "Clients", href: "/clients" },
  { id: "3", label: "Q4 M365 Audit", group: "Audits", href: "/audits" },
  { id: "4", label: "License assessment", group: "Modules", href: "/licenses" },
  { id: "5", label: "Utilization analysis", group: "Modules", href: "/utilization" },
  { id: "6", label: "Compliance RAG", group: "Modules", href: "/compliance" },
  { id: "7", label: "Cost savings roadmap", group: "Modules", href: "/roadmap" },
  { id: "8", label: "Advisory workspace", group: "Modules", href: "/advisory" },
  { id: "9", label: "Client portal", group: "Modules", href: "/portal" },
  { id: "10", label: "Executive Summary — Contoso", group: "Reports", href: "/reports" },
  { id: "11", label: "New Audit", group: "Actions", href: "/audits" },
  { id: "12", label: "Export Report", group: "Actions", href: "/reports" },
];

export function SearchCommand({ results = defaultResults, onSelect }: SearchCommandProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [open]);

  const filtered = query
    ? results.filter((r) => r.label.toLowerCase().includes(query.toLowerCase()))
    : results;

  const grouped = filtered.reduce<Record<string, SearchResult[]>>((acc, item) => {
    (acc[item.group] ??= []).push(item);
    return acc;
  }, {});

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-[var(--button-radius)]",
          "text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)]"
        )}
        aria-label="Search (⌘K)"
      >
        <Search size={18} />
      </button>

      <AnimatePresence>
        {open && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] p-4 md:pt-24"
            role="presentation"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[var(--surface-overlay)]"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Search"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={springConfig}
              className={cn(
                "relative z-10 w-full max-w-lg overflow-hidden rounded-[var(--card-radius)]",
                "border border-[var(--border-default)] bg-[var(--surface-raised)] shadow-[var(--shadow-lg)]"
              )}
            >
              <div className="flex items-center gap-2 border-b border-[var(--border-default)] px-4">
                <Search size={18} className="text-[var(--text-tertiary)]" aria-hidden />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search clients, audits, reports…"
                  aria-label="Search clients, audits, and reports"
                  className="h-12 flex-1 bg-transparent text-[var(--font-body)] outline-none placeholder:text-[var(--text-tertiary)]"
                />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                  aria-label="Close search"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto p-2">
                {Object.entries(grouped).map(([group, items]) => (
                  <div key={group} className="mb-2">
                    <p className="px-2 py-1 text-[var(--font-caption)] font-medium uppercase tracking-[var(--tracking-wide)] text-[var(--text-tertiary)]">
                      {group}
                    </p>
                    {items.map((item) => (
                      <a
                        key={item.id}
                        href={item.href}
                        onClick={(e) => {
                          if (onSelect) {
                            e.preventDefault();
                            onSelect(item);
                          }
                          setOpen(false);
                        }}
                        className="block rounded-[var(--button-radius)] px-3 py-2 text-[var(--font-body-sm)] hover:bg-[var(--brand-primary-muted)] hover:text-[var(--brand-primary)]"
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                ))}
                {filtered.length === 0 && (
                  <p className="px-3 py-6 text-center text-[var(--font-body-sm)] text-[var(--text-tertiary)]">
                    No results found
                  </p>
                )}
              </div>
              <div className="border-t border-[var(--border-default)] px-4 py-2 text-[var(--font-caption)] text-[var(--text-tertiary)]">
                <kbd className="rounded border border-[var(--border-default)] px-1">↵</kbd> to select ·{" "}
                <kbd className="rounded border border-[var(--border-default)] px-1">esc</kbd> to close
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

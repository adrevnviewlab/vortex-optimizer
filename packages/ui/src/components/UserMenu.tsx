"use client";

import { useState } from "react";
import { ChevronDown, LogOut, User } from "lucide-react";
import { cn } from "../lib/cn";

export interface UserMenuProps {
  userName?: string;
  orgName?: string;
  onSignOut?: () => void;
}

export function UserMenu({
  userName = "Alex Consultant",
  orgName = "Vortex Advisory",
  onSignOut,
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 rounded-[var(--button-radius)] px-2 py-1.5",
          "hover:bg-[var(--surface-sunken)]"
        )}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand-primary-subtle)] text-[var(--font-caption)] font-semibold text-[var(--brand-primary)]">
          {initials}
        </span>
        <span className="hidden text-left lg:block">
          <span className="block text-[var(--font-body-sm)] font-medium leading-tight">{userName}</span>
          <span className="block text-[var(--font-caption)] text-[var(--text-tertiary)]">{orgName}</span>
        </span>
        <ChevronDown size={14} className="hidden text-[var(--text-tertiary)] lg:block" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className={cn(
              "absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-[var(--card-radius)]",
              "border border-[var(--border-default)] bg-[var(--surface-raised)] shadow-[var(--shadow-lg)]"
            )}
          >
            <a
              href="/settings"
              className="flex items-center gap-2 px-4 py-2.5 text-[var(--font-body-sm)] hover:bg-[var(--surface-sunken)]"
            >
              <User size={16} />
              Profile
            </a>
            <button
              type="button"
              onClick={() => {
                onSignOut?.();
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-[var(--font-body-sm)] text-[var(--status-red)] hover:bg-[var(--status-red-bg)]"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

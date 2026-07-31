"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { cn } from "../lib/cn";

export interface Notification {
  id: string;
  title: string;
  description: string;
  read: boolean;
  href?: string;
}

const defaultNotifications: Notification[] = [
  {
    id: "1",
    title: "Audit complete",
    description: "Contoso Ltd Q4 audit finished processing",
    read: false,
    href: "/audits",
  },
  {
    id: "2",
    title: "Report ready",
    description: "Executive summary available for Fabrikam Inc",
    read: false,
    href: "/reports",
  },
  {
    id: "3",
    title: "New recommendation",
    description: "3 E5 downgrade opportunities identified",
    read: true,
    href: "/recommendations",
  },
];

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(defaultNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-[var(--button-radius)]",
          "text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)]"
        )}
        aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--status-red)] px-1 text-[10px] font-semibold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className={cn(
              "absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-[var(--card-radius)]",
              "border border-[var(--border-default)] bg-[var(--surface-raised)] shadow-[var(--shadow-lg)]"
            )}
          >
            <div className="border-b border-[var(--border-default)] px-4 py-3">
              <p className="text-[var(--font-body-sm)] font-semibold">Notifications</p>
            </div>
            <ul className="max-h-72 overflow-y-auto">
              {notifications.map((n) => (
                <li key={n.id}>
                  <a
                    href={n.href ?? "#"}
                    onClick={() => markRead(n.id)}
                    className={cn(
                      "block px-4 py-3 hover:bg-[var(--surface-sunken)]",
                      !n.read && "bg-[var(--brand-primary-muted)]"
                    )}
                  >
                    <p className="text-[var(--font-body-sm)] font-medium">{n.title}</p>
                    <p className="mt-0.5 text-[var(--font-caption)] text-[var(--text-secondary)]">
                      {n.description}
                    </p>
                  </a>
                </li>
              ))}
            </ul>
            <div className="border-t border-[var(--border-default)] px-4 py-2">
              <a
                href="/settings"
                className="text-[var(--font-caption)] text-[var(--brand-primary)] hover:underline"
              >
                View all
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

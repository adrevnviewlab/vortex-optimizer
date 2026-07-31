"use client";

import { Menu } from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { NotificationBell } from "./NotificationBell";
import { SearchCommand } from "./SearchCommand";
import { UserMenu } from "./UserMenu";

export interface HeaderBarProps {
  onMenuClick?: () => void;
  onToggleSidebar?: () => void;
  showMobileMenu?: boolean;
}

export function HeaderBar({
  onMenuClick,
  onToggleSidebar,
  showMobileMenu = true,
}: HeaderBarProps) {
  return (
    <header
      className="sticky top-0 z-30 flex h-[var(--header-height)] items-center justify-between border-b border-[var(--border-default)] bg-[var(--surface-canvas)] px-4"
    >
      <div className="flex items-center gap-2">
        {showMobileMenu && (
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-9 w-9 items-center justify-center rounded-[var(--button-radius)] text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)] md:hidden"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        )}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="hidden h-9 w-9 items-center justify-center rounded-[var(--button-radius)] text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)] md:flex"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <div className="hidden md:block">
          <BrandLogo size="sm" href="/dashboard" />
        </div>
      </div>

      <div className="flex items-center gap-1">
        <SearchCommand />
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}

"use client";

import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import type { RagStatus } from "../lib/cn";
import { Card } from "./Card";

const ragAccent: Record<RagStatus, string> = {
  green: "bg-[var(--status-green)]",
  amber: "bg-[var(--status-amber)]",
  red: "bg-[var(--status-red)]",
};

const ragBorder: Record<RagStatus, string> = {
  green: "border-[var(--status-green-border)]",
  amber: "border-[var(--status-amber-border)]",
  red: "border-[var(--status-red-border)]",
};

export interface RagCardProps {
  status: RagStatus;
  children: ReactNode;
  className?: string;
}

export function RagCard({ status, children, className }: RagCardProps) {
  return (
    <Card
      padding={false}
      className={cn("relative overflow-hidden", ragBorder[status], className)}
    >
      <span
        className={cn(
          "absolute inset-y-1.5 left-0 w-[3px] rounded-full",
          ragAccent[status],
        )}
      />
      <div className="p-4 pl-5">{children}</div>
    </Card>
  );
}

"use client";

import type { ReactNode } from "react";
import { Card } from "./Card";

export interface ChartCardProps {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}

export function ChartCard({ title, children, action }: ChartCardProps) {
  return (
    <Card
      header={
        <div className="flex items-center justify-between">
          <span>{title}</span>
          {action}
        </div>
      }
      className="hover:translate-y-0 hover:shadow-[var(--shadow-sm)]"
    >
      <div className="h-64">{children}</div>
    </Card>
  );
}

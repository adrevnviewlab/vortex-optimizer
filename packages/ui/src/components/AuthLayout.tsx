import type { ReactNode } from "react";
import { BrandLogo } from "./BrandLogo";

export interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--surface-canvas)] px-4 py-12">
      <div className="mb-8">
        <BrandLogo size="lg" href="/welcome" />
      </div>
      <div
        className="w-full max-w-md rounded-[var(--card-radius)] border border-[var(--border-default)] bg-[var(--surface-raised)] p-6 shadow-[var(--shadow-md)]"
      >
        <h1 className="text-[var(--font-h2)] font-light tracking-[var(--tracking-tight)]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-[var(--font-body-sm)] text-[var(--text-secondary)]">{subtitle}</p>
        )}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

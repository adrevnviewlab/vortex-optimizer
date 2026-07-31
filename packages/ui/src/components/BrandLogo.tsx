"use client";

import { cn } from "../lib/cn";

export interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  href?: string;
  className?: string;
}

const markSizes = { sm: 24, md: 28, lg: 40 } as const;

function VortexMark({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M16 4C16 4 24 8 24 16C24 24 16 28 16 28"
        stroke="var(--brand-primary)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M16 7C16 7 21 10 21 16C21 22 16 25 16 25"
        stroke="var(--brand-primary)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M16 10C16 10 18.5 12 18.5 16C18.5 20 16 22 16 22"
        stroke="var(--brand-primary)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      <circle cx="16" cy="16" r="2" fill="var(--brand-primary)" />
    </svg>
  );
}

export function BrandLogo({
  size = "md",
  showWordmark = true,
  href,
  className,
}: BrandLogoProps) {
  const markSize = markSizes[size];
  const content = (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <VortexMark size={markSize} />
      {showWordmark && (
        <span className="flex items-baseline gap-0.5 leading-none">
          <span
            className="font-semibold tracking-tight"
            style={{
              fontFamily: "var(--font-display-family, 'Instrument Sans', sans-serif)",
              fontSize: size === "lg" ? "1.25rem" : size === "md" ? "1.0625rem" : "0.9375rem",
              letterSpacing: "var(--tracking-tight)",
            }}
          >
            Vortex
          </span>
          <span
            style={{
              fontFamily: "var(--font-sans, 'Geist Sans', sans-serif)",
              fontSize: size === "lg" ? "1.125rem" : size === "md" ? "0.9375rem" : "0.8125rem",
              fontWeight: 400,
              color: "var(--text-secondary)",
            }}
          >
            Optimizer
          </span>
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <a href={href} className="no-underline text-inherit hover:opacity-90 transition-opacity">
        {content}
      </a>
    );
  }

  return content;
}

export function BrandMark({ size = 32 }: { size?: number }) {
  return <VortexMark size={size} />;
}

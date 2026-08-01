"use client";

import { useMemo, useState } from "react";
import { formatCurrency } from "../../lib/cn";
import { Card } from "../Card";

export interface RoiCalculatorProps {
  title?: string;
  description?: string;
}

export function RoiCalculator({
  title = "Estimate your ROI",
  description = "Typical engagements recover 10–40% of Microsoft licensing spend. Model savings against platform cost.",
}: RoiCalculatorProps) {
  const [annualSpend, setAnnualSpend] = useState(500000);
  const [recoveryRate, setRecoveryRate] = useState(18);
  const [platformCost, setPlatformCost] = useState(9588);

  const { savings, netRoi, roiMultiple } = useMemo(() => {
    const savings = Math.round(annualSpend * (recoveryRate / 100));
    const netRoi = savings - platformCost;
    const roiMultiple = platformCost > 0 ? (savings / platformCost).toFixed(1) : "0";
    return { savings, netRoi, roiMultiple };
  }, [annualSpend, recoveryRate, platformCost]);

  return (
    <section className="mt-16">
      <div className="mb-8 text-center">
        <h2
          className="font-semibold tracking-[var(--tracking-tight)]"
          style={{ fontFamily: "var(--font-display-family)", fontSize: "var(--font-h2)" }}
        >
          {title}
        </h2>
        {description && (
          <p className="mt-3 text-[var(--font-body)] text-[var(--text-secondary)]">{description}</p>
        )}
      </div>
      <Card className="mx-auto max-w-2xl hover:translate-y-0">
        <div className="space-y-6">
          <label className="block">
            <span className="text-[var(--font-body-sm)] font-medium">Annual Microsoft spend (USD)</span>
            <input
              type="range"
              min={50000}
              max={5000000}
              step={50000}
              value={annualSpend}
              onChange={(e) => setAnnualSpend(Number(e.target.value))}
              className="mt-2 w-full accent-[var(--brand-primary)]"
            />
            <span className="mt-1 block text-[var(--font-h3)] font-semibold text-[var(--brand-primary)]">
              {formatCurrency(annualSpend)}
            </span>
          </label>
          <label className="block">
            <span className="text-[var(--font-body-sm)] font-medium">Expected recovery rate (%)</span>
            <input
              type="range"
              min={5}
              max={40}
              step={1}
              value={recoveryRate}
              onChange={(e) => setRecoveryRate(Number(e.target.value))}
              className="mt-2 w-full accent-[var(--brand-primary)]"
            />
            <span className="mt-1 block text-[var(--font-h3)] font-semibold">{recoveryRate}%</span>
          </label>
          <label className="block">
            <span className="text-[var(--font-body-sm)] font-medium">Annual platform cost (USD)</span>
            <input
              type="range"
              min={3588}
              max={50000}
              step={100}
              value={platformCost}
              onChange={(e) => setPlatformCost(Number(e.target.value))}
              className="mt-2 w-full accent-[var(--brand-primary)]"
            />
            <span className="mt-1 block text-[var(--font-body-sm)] text-[var(--text-secondary)]">
              {formatCurrency(platformCost)}/yr (Professional annual ≈ $7,668)
            </span>
          </label>
        </div>
        <div className="mt-8 grid gap-4 border-t border-[var(--border-default)] pt-6 sm:grid-cols-3">
          <div className="text-center">
            <p className="text-[var(--font-caption)] uppercase tracking-[var(--tracking-wide)] text-[var(--text-tertiary)]">
              Identified savings
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--brand-primary)]">
              {formatCurrency(savings)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[var(--font-caption)] uppercase tracking-[var(--tracking-wide)] text-[var(--text-tertiary)]">
              Net ROI
            </p>
            <p className="mt-1 text-2xl font-semibold">{formatCurrency(netRoi)}</p>
          </div>
          <div className="text-center">
            <p className="text-[var(--font-caption)] uppercase tracking-[var(--tracking-wide)] text-[var(--text-tertiary)]">
              Return multiple
            </p>
            <p className="mt-1 text-2xl font-semibold">{roiMultiple}×</p>
          </div>
        </div>
      </Card>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  Badge,
  Card,
  CardGridSkeleton,
  formatCurrency,
  PageHeader,
  ReadinessBadge,
  StatCard,
} from "@vorzop/ui";
import { Map, TrendingDown } from "lucide-react";
import { fetchSavingsRoadmap, type RoadmapPhase } from "@/lib/api-client";

const statusVariant: Record<RoadmapPhase["status"], "info" | "warning" | "success"> = {
  planned: "info",
  in_progress: "warning",
  done: "success",
};

export default function RoadmapPage() {
  const [phases, setPhases] = useState<RoadmapPhase[] | null>(null);
  const [readiness, setReadiness] = useState<string | null>(null);

  useEffect(() => {
    fetchSavingsRoadmap().then(({ phases: rows, readiness: r }) => {
      setPhases(rows);
      setReadiness(r);
    });
  }, []);

  if (!phases) return <CardGridSkeleton count={3} />;

  const total = phases.reduce((s, p) => s + p.savingsAnnual, 0);

  return (
    <>
      <PageHeader
        title="Cost savings roadmap"
        breadcrumb="Phased implementation · Contoso Ltd"
        actions={
          readiness !== "live" ? (
            <ReadinessBadge status="amber" label="Demo roadmap" />
          ) : null
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Roadmap annual savings"
          value={formatCurrency(total)}
          icon={TrendingDown}
          accent="var(--status-green)"
        />
        <StatCard label="Phases" value={phases.length} icon={Map} accent="var(--brand-primary)" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {phases.map((phase) => (
          <Card key={phase.id} header={phase.phase}>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant="brand">{phase.window}</Badge>
              <Badge variant="default">{phase.effort} effort</Badge>
              <Badge variant={statusVariant[phase.status]}>{phase.status.replace("_", " ")}</Badge>
            </div>
            <p className="mb-3 text-lg font-semibold text-[var(--brand-primary)]">
              {formatCurrency(phase.savingsAnnual)}
              <span className="ml-1 text-[var(--font-caption)] font-normal text-[var(--text-tertiary)]">
                / yr
              </span>
            </p>
            <ul className="space-y-2">
              {phase.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-[var(--font-body-sm)] text-[var(--text-secondary)]"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-[var(--brand-primary)]" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </>
  );
}

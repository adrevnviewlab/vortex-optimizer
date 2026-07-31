"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Badge,
  Card,
  CardGridSkeleton,
  computeTrafficLight,
  formatCurrency,
  PageHeader,
  SpringActionButton,
  TrafficLight,
} from "@vorzop/ui";
import {
  fetchRecommendations,
  patchRecommendation,
  type RecommendationItem,
} from "@/lib/api-client";

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<RecommendationItem[] | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { recommendations: rows } = await fetchRecommendations();
    setRecommendations(rows);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAction(recId: string, status: "approved" | "rejected") {
    setUpdatingId(recId);
    const { ok } = await patchRecommendation(recId, { status });
    if (ok) {
      setRecommendations((prev) =>
        prev?.map((r) => (r.id === recId ? { ...r, status } : r)) ?? null,
      );
    }
    setUpdatingId(null);
  }

  if (!recommendations) return <CardGridSkeleton count={3} />;

  return (
    <>
      <PageHeader
        title="Recommendations"
        actions={<SpringActionButton label="New Recommendation" iconOnly />}
      />

      <div className="space-y-4">
        {recommendations.map((rec) => (
          <Card key={rec.id} className="hover:translate-y-0">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-[var(--font-h3)] font-semibold">{rec.title}</h3>
                <p className="mt-1 text-[var(--font-body-sm)] text-[var(--text-secondary)]">
                  {rec.skus} · {rec.confidence}% confidence
                </p>
                {rec.description && (
                  <p className="mt-1 text-[var(--font-body-sm)] text-[var(--text-tertiary)]">
                    {rec.description}
                  </p>
                )}
                <p className="mt-2 text-lg font-semibold text-[var(--status-green)]">
                  Est. savings: {formatCurrency(rec.savings)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <TrafficLight status={computeTrafficLight(rec.compliance, rec.savingsPct)} showLabel />
                <Badge
                  variant={
                    rec.status === "approved"
                      ? "success"
                      : rec.status === "rejected"
                        ? "default"
                        : "warning"
                  }
                >
                  {rec.status === "approved"
                    ? "Approved"
                    : rec.status === "rejected"
                      ? "Dismissed"
                      : "Open"}
                </Badge>
              </div>
            </div>
            {rec.status === "draft" && (
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  disabled={updatingId === rec.id}
                  onClick={() => handleAction(rec.id, "approved")}
                  className="rounded-[var(--button-radius)] bg-[var(--brand-primary)] px-3 py-1.5 text-[var(--font-body-sm)] font-medium text-white hover:bg-[var(--brand-primary-hover)] disabled:opacity-50"
                >
                  Apply
                </button>
                <button
                  type="button"
                  disabled={updatingId === rec.id}
                  onClick={() => handleAction(rec.id, "rejected")}
                  className="rounded-[var(--button-radius)] px-3 py-1.5 text-[var(--font-body-sm)] text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)] disabled:opacity-50"
                >
                  Dismiss
                </button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </>
  );
}

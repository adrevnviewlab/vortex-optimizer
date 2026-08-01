"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardGridSkeleton,
  computeTrafficLight,
  Dialog,
  DialogContent,
  formatCurrency,
  PageHeader,
  RagCard,
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
        {recommendations.map((rec) => {
          const rag = computeTrafficLight(rec.compliance, rec.savingsPct);
          return (
            <RagCard key={rec.id} status={rag}>
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
                  <TrafficLight status={rag} showLabel />
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
                  <Button
                    size="sm"
                    disabled={updatingId === rec.id}
                    onClick={() => handleAction(rec.id, "approved")}
                  >
                    Apply
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={updatingId === rec.id}
                    onClick={() => handleAction(rec.id, "rejected")}
                  >
                    Dismiss
                  </Button>
                </div>
              )}
            </RagCard>
          );
        })}
      </div>
    </>
  );
}

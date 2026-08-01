"use client";

import { useEffect, useState } from "react";
import {
  Badge,
  Card,
  PageHeader,
  RagCard,
  TrafficLight,
  type RagStatus,
} from "@vorzop/ui";
import { fetchReadiness, type ReadinessModule } from "@/lib/api-client";

function readinessToRag(status: ReadinessModule["status"]): RagStatus {
  if (status === "live") return "green";
  if (status === "stub") return "amber";
  return "red";
}

export default function ReadinessPage() {
  const [modules, setModules] = useState<ReadinessModule[] | null>(null);

  useEffect(() => {
    fetchReadiness().then(({ modules: m }) => setModules(m));
  }, []);

  return (
    <>
      <PageHeader
        title="Readiness checklist"
        breadcrumb="Settings"
      />

      <Card header="Module status">
        {!modules ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-[var(--surface-sunken)]" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {modules.map((mod) => {
              const rag = readinessToRag(mod.status);
              return (
                <RagCard key={mod.key} status={rag} className="hover:translate-y-0">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[var(--font-body-sm)] font-medium">{mod.label}</p>
                      {mod.message && (
                        <p className="text-[var(--font-caption)] text-[var(--text-secondary)]">
                          {mod.message}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          mod.status === "live"
                            ? "success"
                            : mod.status === "stub"
                              ? "warning"
                              : "danger"
                        }
                      >
                        {mod.status}
                      </Badge>
                      <TrafficLight status={rag} />
                    </div>
                  </div>
                </RagCard>
              );
            })}
          </div>
        )}
      </Card>
    </>
  );
}

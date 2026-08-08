"use client";

import { useEffect, useState } from "react";
import {
  Badge,
  Card,
  CardGridSkeleton,
  PageHeader,
  ReadinessBadge,
  SpringActionButton,
  useToast,
} from "@vorzop/ui";
import { fetchAdvisoryNotes, type AdvisoryNote } from "@/lib/api-client";

const typeVariant: Record<AdvisoryNote["type"], "brand" | "info" | "default"> = {
  meeting: "brand",
  email: "info",
  note: "default",
};

export default function AdvisoryPage() {
  const { addToast } = useToast();
  const [notes, setNotes] = useState<AdvisoryNote[] | null>(null);
  const [readiness, setReadiness] = useState<string | null>(null);

  useEffect(() => {
    fetchAdvisoryNotes().then(({ notes: rows, readiness: r }) => {
      setNotes(rows);
      setReadiness(r);
    });
  }, []);

  if (!notes) return <CardGridSkeleton count={3} />;

  return (
    <>
      <PageHeader
        title="Advisory workspace"
        breadcrumb="Meeting log · notes · follow-ups"
        actions={
          <div className="flex items-center gap-2">
            {readiness !== "live" ? (
              <ReadinessBadge status="amber" label="Local notes" />
            ) : null}
            <SpringActionButton
              label="Log note"
              onClick={() =>
                addToast({
                  title: "Note logged",
                  description: "Advisory notes sync when the API workspace module is live.",
                  variant: "default",
                })
              }
            />
          </div>
        }
      />

      <div className="space-y-4">
        {notes.map((note) => (
          <Card key={note.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant={typeVariant[note.type]}>{note.type}</Badge>
                  <span className="text-[var(--font-body-sm)] font-semibold">{note.client}</span>
                  <span className="text-[var(--font-caption)] text-[var(--text-tertiary)]">
                    {note.date} · {note.author}
                  </span>
                </div>
                <p className="text-[var(--font-body-sm)] text-[var(--text-secondary)]">{note.summary}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

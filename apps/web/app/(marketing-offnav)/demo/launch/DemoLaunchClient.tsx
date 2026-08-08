"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AuthLayout, Button } from "@vorzop/ui";
import { launchDemoSession } from "./actions";

export function DemoLaunchClient() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    startTransition(async () => {
      const result = await launchDemoSession();
      if (result?.error) {
        setError(result.error);
      }
    });
  }, []);

  async function handleRetry() {
    setError(null);
    startTransition(async () => {
      const result = await launchDemoSession();
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <AuthLayout
      title="Explore live demo"
      subtitle="Signing you into the Contoso Ltd workspace — seeded Microsoft licensing data, no credentials required."
    >
      <div className="space-y-4">
        {pending && !error ? (
          <p className="text-center text-[var(--font-body-sm)] text-[var(--text-secondary)]">
            Launching demo session…
          </p>
        ) : null}

        {error ? (
          <>
            <p className="text-[var(--font-body-sm)] text-[var(--status-danger)]">{error}</p>
            <Button
              type="button"
              variant="primary"
              className="w-full"
              onClick={handleRetry}
              disabled={pending}
            >
              {pending ? "Retrying…" : "Try again"}
            </Button>
            <a
              href="/login?demo=1"
              className="block text-center text-[var(--font-body-sm)] text-[var(--brand-primary)] hover:underline"
            >
              Fall back to demo login form
            </a>
          </>
        ) : (
          <Button
            type="button"
            variant="primary"
            className="w-full"
            onClick={handleRetry}
            disabled={pending}
          >
            {pending ? "Signing in…" : "Continue to dashboard"}
          </Button>
        )}

        <p className="text-center text-[var(--font-caption)] text-[var(--text-tertiary)]">
          Prefer a guided tour?{" "}
          <a href="/demo" className="text-[var(--brand-primary)] hover:underline">
            See the walkthrough
          </a>
        </p>
      </div>
    </AuthLayout>
  );
}

"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout, Button, TextInput } from "@vorzop/ui";

const DEMO_EMAIL = "admin@vortexoptimizer.com";
const DEMO_PASSWORD = "demo-password";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const isDemo = searchParams.get("demo") === "1";

  const [email, setEmail] = useState(isDemo ? DEMO_EMAIL : "");
  const [password, setPassword] = useState(isDemo ? DEMO_PASSWORD : "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const demoSubmitted = useRef(false);

  async function submitCredentials(nextEmail: string, nextPassword: string) {
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email: nextEmail,
      password: nextPassword,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  useEffect(() => {
    if (!isDemo || demoSubmitted.current) return;
    demoSubmitted.current = true;
    void submitCredentials(DEMO_EMAIL, DEMO_PASSWORD);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot demo auto-submit
  }, [isDemo]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submitCredentials(email, password);
  }

  return (
    <AuthLayout title="Sign in" subtitle="One tenant. One optimization workspace.">
      {isDemo ? (
        <p className="mb-4 rounded-[var(--button-radius)] bg-[var(--brand-primary-muted)] px-3 py-2 text-[var(--font-body-sm)] text-[var(--brand-primary)]">
          Demo mode — signing in as Contoso Ltd seed user…
        </p>
      ) : null}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <TextInput
          label="Email"
          type="email"
          placeholder="admin@vortexoptimizer.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextInput
          label="Password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && (
          <p className="text-[var(--font-body-sm)] text-[var(--status-danger)]">{error}</p>
        )}
        <Button type="submit" variant="primary" className="w-full spring-press" disabled={loading}>
          {loading ? "Signing in…" : isDemo ? "Continue to demo" : "Sign in"}
        </Button>
        <Button type="button" variant="secondary" className="w-full" disabled>
          Continue with SSO
        </Button>
      </form>
      <p className="mt-4 text-center text-[var(--font-body-sm)] text-[var(--text-secondary)]">
        Don&apos;t have an account?{" "}
        <a href="/signup" className="text-[var(--brand-primary)] hover:underline">
          Sign up
        </a>
      </p>
      <p className="mt-2 text-center text-[var(--font-body-sm)]">
        <a href="/demo/launch" className="text-[var(--brand-primary)] hover:underline">
          Try the live demo (one click)
        </a>
      </p>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

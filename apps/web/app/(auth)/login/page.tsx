"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout, Button, TextInput } from "@vorzop/ui";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
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

  return (
    <AuthLayout title="Sign in" subtitle="One tenant. One optimization workspace.">
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
          {loading ? "Signing in…" : "Sign in"}
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

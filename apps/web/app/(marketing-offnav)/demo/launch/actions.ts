"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";

const DEMO_EMAIL = "admin@vortexoptimizer.com";

function isDemoLoginEnabled(): boolean {
  return (
    process.env.ENABLE_DEMO_LOGIN === "true" ||
    process.env.SEED_DEMO_DATA === "true"
  );
}

export async function launchDemoSession(): Promise<{ error?: string }> {
  if (!isDemoLoginEnabled()) {
    return { error: "Demo login is disabled on this environment." };
  }

  try {
    await signIn("credentials", {
      email: DEMO_EMAIL,
      password: process.env.DEMO_PASSWORD ?? "demo-password",
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof (error as { digest?: unknown }).digest === "string" &&
      (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    if (error instanceof AuthError) {
      return {
        error:
          "Demo sign-in failed. Ensure seed data exists (admin@vortexoptimizer.com / demo-password).",
      };
    }

    throw error;
  }

  redirect("/dashboard");
}

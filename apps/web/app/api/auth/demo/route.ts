import { AuthError } from "next-auth";
import { NextResponse } from "next/server";
import { signIn } from "@/auth";
import { rejectCrossOriginMutation } from "@/lib/validate-origin";

const DEMO_EMAIL = "admin@vortexoptimizer.com";

function isDemoLoginEnabled(): boolean {
  return (
    process.env.ENABLE_DEMO_LOGIN === "true" ||
    process.env.SEED_DEMO_DATA === "true"
  );
}

function demoPassword(): string {
  return process.env.DEMO_PASSWORD ?? "demo-password";
}

/**
 * One-click demo sign-in for website visitors.
 * Enabled when ENABLE_DEMO_LOGIN=true or SEED_DEMO_DATA=true.
 */
export async function POST(request: Request) {
  const forbidden = rejectCrossOriginMutation(request);
  if (forbidden) return forbidden;

  if (!isDemoLoginEnabled()) {
    return NextResponse.json(
      { error: "Demo login is disabled on this environment." },
      { status: 403 },
    );
  }

  const wantsJson =
    request.headers.get("accept")?.includes("application/json") ||
    request.headers.get("content-type")?.includes("application/json");

  try {
    await signIn("credentials", {
      email: DEMO_EMAIL,
      password: demoPassword(),
      redirectTo: "/dashboard",
      redirect: !wantsJson,
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
      return NextResponse.json(
        {
          error:
            "Demo sign-in failed. Ensure the database is seeded (admin@vortexoptimizer.com).",
        },
        { status: 401 },
      );
    }

    throw error;
  }

  return NextResponse.json({ ok: true, redirectTo: "/dashboard" });
}

/** Convenience link target — send browsers to the launch UI. */
export async function GET(request: Request) {
  return NextResponse.redirect(new URL("/demo/launch", request.url));
}

import { NextResponse } from "next/server";

function allowedOrigin(): string {
  const base =
    process.env.AUTH_URL ??
    process.env.APP_URL ??
    "http://localhost:3000";
  return new URL(base).origin;
}

/** Returns a 403 response when Origin header disagrees with AUTH_URL; null if OK. */
export function rejectCrossOriginMutation(request: Request): NextResponse | null {
  const origin = request.headers.get("origin");
  if (!origin) return null;

  if (origin !== allowedOrigin()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}

import { NextResponse } from "next/server";
import { getSessionTokenForBridge } from "@/auth";
import { rejectCrossOriginMutation } from "@/lib/validate-origin";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.API_URL ??
  "http://localhost:4000";

export async function POST(request: Request) {
  const forbidden = rejectCrossOriginMutation(request);
  if (forbidden) return forbidden;

  const bridge = await getSessionTokenForBridge();
  if (!bridge) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(`${API_URL}/v1/auth/session-bridge`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sessionToken: bridge.sessionToken,
        activeOrgId: bridge.activeOrgId,
      }),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Session bridge failed" },
        { status: res.status },
      );
    }

    const json = (await res.json()) as {
      data: { token: string; expiresAt: string; userId: string };
      meta: { readiness: string };
    };

    return NextResponse.json(json);
  } catch {
    return NextResponse.json({ error: "API unreachable" }, { status: 503 });
  }
}

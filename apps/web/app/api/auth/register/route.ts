import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { organizationMembers, users } from "@vorzop/db";
import { SEED_IDS } from "@vorzop/db";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { rejectCrossOriginMutation } from "@/lib/validate-origin";

const registerSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  const forbidden = rejectCrossOriginMutation(request);
  if (forbidden) return forbidden;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid registration data" }, { status: 400 });
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();
  const db = getDb();

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [created] = await db
    .insert(users)
    .values({
      email: normalizedEmail,
      name,
      passwordHash,
    })
    .returning({ id: users.id });

  await db.insert(organizationMembers).values({
    orgId: SEED_IDS.consultancyOrg,
    userId: created!.id,
    role: "viewer",
    joinedAt: new Date(),
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}

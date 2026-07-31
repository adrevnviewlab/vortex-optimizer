import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import { and, desc, eq, gt } from "drizzle-orm";
import {
  organizationMembers,
  sessions,
  users,
} from "@vorzop/db/schema";
import type { OrgRole } from "@vorzop/shared";
import { getDb } from "./lib/db";

type AppJwt = JWT & {
  userId?: string;
  activeOrgId?: string;
  role?: OrgRole;
  sessionToken?: string;
};

type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  activeOrgId: string;
  role: OrgRole;
  sessionToken: string;
};

async function resolveMembership(userId: string) {
  const db = getDb();
  const rows = await db
    .select({
      orgId: organizationMembers.orgId,
      role: organizationMembers.role,
    })
    .from(organizationMembers)
    .where(eq(organizationMembers.userId, userId))
    .limit(1);

  if (rows.length === 0) {
    return null;
  }

  return {
    activeOrgId: rows[0]!.orgId,
    role: rows[0]!.role as OrgRole,
  };
}

async function persistSession(userId: string, sessionToken: string) {
  const db = getDb();
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await db.insert(sessions).values({
    sessionToken,
    userId,
    expires,
  });
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<AuthUser | null> {
        const email = credentials?.email?.toString().trim().toLowerCase();
        const password = credentials?.password?.toString();

        if (!email || !password) {
          return null;
        }

        const db = getDb();
        const rows = await db
          .select({
            id: users.id,
            email: users.email,
            name: users.name,
            passwordHash: users.passwordHash,
          })
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        const user = rows[0];
        if (!user?.passwordHash) {
          return null;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
          return null;
        }

        const membership = await resolveMembership(user.id);
        if (!membership) {
          return null;
        }

        const sessionBytes = globalThis.crypto.getRandomValues(new Uint8Array(32));
        const sessionToken = Array.from(sessionBytes, (b) =>
          b.toString(16).padStart(2, "0"),
        ).join("");
        await persistSession(user.id, sessionToken);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          activeOrgId: membership.activeOrgId,
          role: membership.role,
          sessionToken,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const appToken = token as AppJwt;
      if (user) {
        const authUser = user as AuthUser;
        appToken.userId = authUser.id;
        appToken.activeOrgId = authUser.activeOrgId;
        appToken.role = authUser.role;
        appToken.sessionToken = authUser.sessionToken;
        appToken.email = authUser.email;
        appToken.name = authUser.name;
      }
      return appToken;
    },
    async session({ session, token }) {
      const appToken = token as AppJwt;
      if (appToken.userId && appToken.activeOrgId && appToken.role) {
        Object.assign(session.user, {
          id: appToken.userId,
          email: appToken.email ?? "",
          name: appToken.name ?? null,
          activeOrgId: appToken.activeOrgId,
          role: appToken.role,
        });
      }
      return session;
    },
  },
});

export async function getSessionTokenForBridge(): Promise<{
  sessionToken: string;
  activeOrgId: string;
} | null> {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const db = getDb();
  const rows = await db
    .select({ sessionToken: sessions.sessionToken })
    .from(sessions)
    .where(
      and(
        eq(sessions.userId, session.user.id),
        gt(sessions.expires, new Date()),
      ),
    )
    .orderBy(desc(sessions.expires))
    .limit(1);

  const sessionToken = rows[0]?.sessionToken;
  if (!sessionToken) {
    return null;
  }

  return {
    sessionToken,
    activeOrgId: session.user.activeOrgId,
  };
}

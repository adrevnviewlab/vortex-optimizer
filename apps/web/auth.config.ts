import type { NextAuthConfig } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { OrgRole } from "@vorzop/shared";

export type AppJwt = JWT & {
  userId?: string;
  activeOrgId?: string;
  role?: OrgRole;
  sessionToken?: string;
};

/**
 * Edge-safe Auth.js config used by middleware.
 * Must not import pg, drizzle node-postgres, bcrypt, or any Node-only modules.
 * DB-backed Credentials authorize lives in auth.ts (Node route handlers only).
 */
export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      const appToken = token as AppJwt;
      if (user) {
        const authUser = user as {
          id: string;
          email: string;
          name: string | null;
          activeOrgId: string;
          role: OrgRole;
          sessionToken: string;
        };
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
} satisfies NextAuthConfig;

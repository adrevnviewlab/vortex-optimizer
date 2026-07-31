import type { DefaultSession } from "next-auth";
import type { OrgRole } from "@vorzop/shared";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      activeOrgId: string;
      role: OrgRole;
    } & DefaultSession["user"];
  }
}

export {};

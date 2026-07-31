import { SignJWT, jwtVerify } from "jose";
import type { OrgRole } from "@vorzop/shared";
import { getJwtSecret } from "./env.js";

const JWT_ISSUER = "vorzop-api";
const JWT_AUDIENCE = "vorzop-web";
const JWT_TTL_SECONDS = 15 * 60;

export type ApiJwtPayload = {
  sub: string;
  orgId?: string;
  role?: OrgRole;
};

function getSecretKey() {
  return new TextEncoder().encode(getJwtSecret());
}

export async function signApiJwt(payload: ApiJwtPayload): Promise<{
  token: string;
  expiresAt: Date;
}> {
  const expiresAt = new Date(Date.now() + JWT_TTL_SECONDS * 1000);

  const token = await new SignJWT({
    orgId: payload.orgId,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .sign(getSecretKey());

  return { token, expiresAt };
}

export async function verifyApiJwt(token: string): Promise<ApiJwtPayload> {
  const { payload } = await jwtVerify(token, getSecretKey(), {
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });

  if (!payload.sub) {
    throw new Error("Invalid token: missing subject");
  }

  return {
    sub: payload.sub,
    orgId: typeof payload.orgId === "string" ? payload.orgId : undefined,
    role: typeof payload.role === "string" ? (payload.role as OrgRole) : undefined,
  };
}

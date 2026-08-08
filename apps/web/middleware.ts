import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { authConfig } from "./auth.config";

/**
 * Paths that must never throw from middleware (marketing + auth entry).
 * Prefer pass-through over MIDDLEWARE_INVOCATION_FAILED when AUTH_SECRET
 * is missing or NextAuth fails on Edge.
 */
const PUBLIC_PATHS = new Set([
  "/",
  "/welcome",
  "/features",
  "/pricing",
  "/pitch",
  "/demo",
  "/demo/launch",
  "/login",
  "/signup",
]);

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/clients",
  "/audits",
  "/licenses",
  "/utilization",
  "/compliance",
  "/recommendations",
  "/roadmap",
  "/renewals",
  "/reports",
  "/advisory",
  "/portal",
  "/settings",
  "/admin",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.has(pathname) || pathname.startsWith("/demo/");
}

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

type AuthMiddleware = (
  req: NextRequest,
  event: NextFetchEvent,
) => Response | Promise<Response | undefined> | undefined;

let cachedAuthMiddleware: AuthMiddleware | null = null;

function getAuthMiddleware(): AuthMiddleware | null {
  if (!process.env.AUTH_SECRET) {
    return null;
  }
  if (!cachedAuthMiddleware) {
    const { auth } = NextAuth(authConfig);
    const wrapped = auth((req) => {
      const { pathname } = req.nextUrl;

      if (isProtectedPath(pathname) && !req.auth) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }

      if ((pathname === "/login" || pathname === "/signup") && req.auth) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      return NextResponse.next();
    });
    cachedAuthMiddleware = wrapped as unknown as AuthMiddleware;
  }
  return cachedAuthMiddleware;
}

export default async function middleware(
  req: NextRequest,
  event: NextFetchEvent,
) {
  const { pathname } = req.nextUrl;

  try {
    const authMiddleware = getAuthMiddleware();
    if (!authMiddleware) {
      if (isPublicPath(pathname) || !isProtectedPath(pathname)) {
        return NextResponse.next();
      }
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return (await authMiddleware(req, event)) ?? NextResponse.next();
  } catch {
    if (isPublicPath(pathname) || !isProtectedPath(pathname)) {
      return NextResponse.next();
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/clients/:path*",
    "/audits/:path*",
    "/licenses/:path*",
    "/utilization/:path*",
    "/compliance/:path*",
    "/recommendations/:path*",
    "/roadmap/:path*",
    "/renewals/:path*",
    "/reports/:path*",
    "/advisory/:path*",
    "/portal/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/login",
    "/signup",
    "/demo/launch",
  ],
};

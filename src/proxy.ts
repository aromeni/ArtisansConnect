import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Session } from "next-auth";

/**
 * Route protection rules (Next.js 16 "proxy" convention — previously "middleware").
 *
 *   /customer/*         → CUSTOMER only
 *   /tradesperson/*     → TRADESPERSON only
 *   /admin/*            → ADMIN | SUPER_ADMIN only
 *   /onboarding/*       → authenticated users who haven't completed onboarding
 *   /sign-in, /sign-up  → redirect to dashboard if already signed in
 */

const PUBLIC_PATHS = [
  "/",
  "/how-it-works",
  "/categories",
  "/tradespeople",
  "/trust-safety",
  "/pricing",
  "/about",
  "/help",
  "/contact",
  "/sign-in",
  "/sign-up",
  "/verify-email",
  "/api/auth",
  "/api/webhooks",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

type AuthRequest = NextRequest & { auth: Session | null };

export const proxy = auth((req: AuthRequest) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Allow public paths and static assets through
  if (
    isPublicPath(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    pathname.match(/\.(png|jpg|jpeg|svg|ico|webp|css|js)$/)
  ) {
    // If signed in and hitting auth pages, redirect to appropriate dashboard
    if (session && (pathname === "/sign-in" || pathname === "/sign-up")) {
      return NextResponse.redirect(new URL(getDashboardUrl(session), req.url));
    }
    return NextResponse.next();
  }

  // Everything else requires authentication
  if (!session) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  const { role, onboardingComplete } = session.user;

  // Force onboarding if not complete (except for onboarding routes themselves)
  if (!onboardingComplete && !pathname.startsWith("/onboarding")) {
    const target =
      role === "CUSTOMER"
        ? "/onboarding/customer"
        : role === "TRADESPERSON"
          ? "/onboarding/tradesperson"
          : "/dashboard";
    return NextResponse.redirect(new URL(target, req.url));
  }

  // Role-based route guards
  if (pathname.startsWith("/customer") && role !== "CUSTOMER") {
    return NextResponse.redirect(new URL(getDashboardUrl(session), req.url));
  }

  if (pathname.startsWith("/tradesperson") && role !== "TRADESPERSON") {
    return NextResponse.redirect(new URL(getDashboardUrl(session), req.url));
  }

  if (
    pathname.startsWith("/admin") &&
    role !== "ADMIN" &&
    role !== "SUPER_ADMIN"
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

function getDashboardUrl(session: Session): string {
  const { role, onboardingComplete } = session.user;
  switch (role) {
    case "CUSTOMER":
      return onboardingComplete ? "/customer/dashboard" : "/onboarding/customer";
    case "TRADESPERSON":
      return onboardingComplete
        ? "/tradesperson/dashboard"
        : "/onboarding/tradesperson";
    case "ADMIN":
    case "SUPER_ADMIN":
      return "/admin/dashboard";
    default:
      return "/";
  }
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

import { NextRequest, NextResponse } from "next/server";

// Routes that require authentication
const PROTECTED_ROUTES = ["/huttspotter", "/agent", "/onboarding"];

// Routes only for unauthenticated users
// (logged-in users should not see these)
const AUTH_ROUTES = ["/auth/signin", "/auth/signup", "/auth"];

// Routes that are always public
const PUBLIC_ROUTES = ["/", "/auth/verify-email", "/auth/check-email"];

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // ── Handle verify-email token ─────────────────────────────
  if (pathname === "/auth/verify-email") {
    const verifyToken = searchParams.get("token");
    if (verifyToken) {
      const response = NextResponse.redirect(
        new URL("/auth/verify-email", request.url),
      );
      response.cookies.set("verify_token", verifyToken, {
        httpOnly: false,
        maxAge: 60 * 15,
        path: "/",
        sameSite: "lax",
      });
      return response;
    }
  }

  const token = request.cookies.get("token")?.value;

  // ── Protect private routes ────────────────────────────────
  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  if (isProtected && !token) {
    const url = new URL("/auth/signin", request.url);
    // Remember where they were trying to go
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // ── Redirect logged-in users away from auth pages ─────────
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/auth/verify-email",
    "/huttspotter/:path*",
    "/agent/:path*",
    "/onboarding/:path*",
    "/auth/signin",
    "/auth/signup",
    "/auth",
  ],
};

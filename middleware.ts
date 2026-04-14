import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const token = searchParams.get("token");

  if (pathname === "/auth/verify-email" && token) {
    // Only intercept when token is in URL
    const response = NextResponse.redirect(
      new URL("/auth/verify-email", request.url), // redirect to clean URL
    );

    response.cookies.set("verify_token", token, {
      httpOnly: false,
      maxAge: 60 * 15,
      path: "/",
      sameSite: "lax",
    });

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/auth/verify-email"],
};

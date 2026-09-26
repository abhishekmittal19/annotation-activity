import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // Don't protect Next.js internals or API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Read authentication cookie
  const token = request.cookies.get("aurora_token")?.value;

  // No authentication cookie → login
  if (!token) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";

    return NextResponse.redirect(loginUrl);
  }

  // Authenticated
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Run middleware on application routes.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

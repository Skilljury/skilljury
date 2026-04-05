import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Canonical host redirect: ensure all traffic resolves to www.skilljury.com
 * This fixes the URL canonicalization SEO issue where skilljury.com and
 * www.skilljury.com resolve to different effective URLs.
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";

  // In production, redirect bare domain → www canonical
  if (
    process.env.NODE_ENV === "production" &&
    host === "skilljury.com"
  ) {
    const url = request.nextUrl.clone();
    url.host = "www.skilljury.com";
    return NextResponse.redirect(url, { status: 301 });
  }

  return NextResponse.next();
}

export const config = {
  // Run on all paths except Next.js internals and static files
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  // Preserve the bare-domain to www redirect in Next 16's proxy entry point.
  const host = request.headers.get("host") ?? "";

  if (process.env.NODE_ENV === "production" && host === "skilljury.com") {
    const url = request.nextUrl.clone();
    url.host = "www.skilljury.com";
    return NextResponse.redirect(url, { status: 301 });
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

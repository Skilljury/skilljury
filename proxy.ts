import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Supabase session refresh only runs on routes that still require live auth.
  // Public recovery surfaces (homepage, login, account and submission notices,
  // skill detail, review archive and review submission pages, categories, agents,
  // sources, sitemap, robots and static assets) skip the proxy so anonymous
  // visitors do not hit the restricted provider during read-only recovery.
  //
  // The bare-domain → www redirect lives in next.config.ts redirects() so it
  // runs at the CDN edge with zero function invocation.
  matcher: [
    "/admin/:path*",
    "/auth/:path*",
    "/reset-password",
    "/api/auth/:path*",
    "/api/moderation/:path*",
    "/api/reports/:path*",
    "/api/review-requests/:path*",
    "/api/reviews/:path*",
    "/api/submissions/:path*",
  ],
};

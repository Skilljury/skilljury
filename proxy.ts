import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Supabase session refresh only runs on auth-sensitive routes. Public
  // browsing (homepage, skill detail pages, categories, agents, sources,
  // sitemap, robots, static assets) skips the proxy entirely so crawlers and
  // anonymous visitors don't burn Fluid Active CPU on a Supabase auth call
  // per request. Server components on those pages can still read cookies via
  // `cookies()` directly — the proxy is only needed to refresh near-expired
  // tokens before the user performs an auth-gated action.
  //
  // The bare-domain → www redirect moved to `next.config.ts` redirects() so
  // it runs at the CDN edge with zero function invocation.
  matcher: [
    "/account/:path*",
    "/admin/:path*",
    "/auth/:path*",
    "/login",
    "/reset-password",
    "/submit-skill",
    "/skills/:skillSlug/review",
    "/skills/:skillSlug/reviews",
    "/api/auth/:path*",
    "/api/moderation/:path*",
    "/api/reports/:path*",
    "/api/review-requests/:path*",
    "/api/reviews/:path*",
    "/api/submissions/:path*",
  ],
};

import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Supabase session refresh only runs on auth-sensitive routes. Public
  // browsing (homepage, login recovery notice, skill detail and review archive
  // recovery pages, categories, agents, sources, sitemap, robots, static assets)
  // skips the proxy entirely so crawlers and anonymous visitors don't burn Fluid
  // Active CPU or fail when Supabase environment access is unavailable. Server
  // components on authenticated pages can still read cookies via `cookies()`;
  // the proxy is only needed to refresh near-expired tokens before the user
  // performs an auth-gated action.
  //
  // The bare-domain → www redirect moved to `next.config.ts` redirects() so
  // it runs at the CDN edge with zero function invocation.
  matcher: [
    "/account/:path*",
    "/admin/:path*",
    "/auth/:path*",
    "/reset-password",
    "/submit-skill",
    "/skills/:skillSlug/review",
    "/api/auth/:path*",
    "/api/moderation/:path*",
    "/api/reports/:path*",
    "/api/review-requests/:path*",
    "/api/reviews/:path*",
    "/api/submissions/:path*",
  ],
};

import type { MetadataRoute } from "next";

import { buildCanonicalUrl } from "@/lib/seo/metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/account/", "/login", "/designs/", "/reset-password"],
      },
    ],
    sitemap: buildCanonicalUrl("/sitemap.xml"),
  };
}

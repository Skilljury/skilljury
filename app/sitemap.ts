import type { MetadataRoute } from "next";

import { getAllAgentSlugs } from "@/lib/db/agents";
import { getAllCategorySlugs } from "@/lib/db/categories";
import { getAllSkillSlugs } from "@/lib/db/skills";
import { getAllSourceSlugs } from "@/lib/db/sourcePages";
import { encodeSourceSlug } from "@/lib/routing/sourceSlug";
import { buildCanonicalUrl } from "@/lib/seo/metadata";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [skillSlugs, categorySlugs, agentSlugs, sourceSlugs] = await Promise.all([
    getAllSkillSlugs(),
    getAllCategorySlugs(),
    getAllAgentSlugs(),
    getAllSourceSlugs(),
  ]);
  const staticRoutes = [
    "",
    "/about",
    "/how-scores-work",
    "/moderation-policy",
    "/new",
    "/privacy",
    "/review-guidelines",
    "/search",
    "/terms",
    "/top-rated",
    "/trending",
  ];

  return [
    ...staticRoutes.map((pathname) => ({
      url: buildCanonicalUrl(pathname || "/"),
      lastModified: new Date(),
      changeFrequency: pathname ? ("weekly" as const) : ("daily" as const),
      priority: pathname ? 0.7 : 1,
    })),
    ...skillSlugs.map((slug) => ({
      url: buildCanonicalUrl(`/skills/${slug}`),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...skillSlugs.map((slug) => ({
      url: buildCanonicalUrl(`/skills/${slug}/reviews`),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...categorySlugs.map((slug) => ({
      url: buildCanonicalUrl(`/categories/${slug}`),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...agentSlugs.map((slug) => ({
      url: buildCanonicalUrl(`/agents/${slug}`),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...sourceSlugs.map((slug) => ({
      url: buildCanonicalUrl(`/sources/${encodeSourceSlug(slug)}`),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}

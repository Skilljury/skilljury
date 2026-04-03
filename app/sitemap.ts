import type { MetadataRoute } from "next";

import { getAllAgentSlugs } from "@/lib/db/agents";
import { getAllCategorySlugs } from "@/lib/db/categories";
import { getAllSkillSitemapEntries } from "@/lib/db/skills";
import { getAllSourceSitemapEntries } from "@/lib/db/sourcePages";
import { encodeSourceSlug } from "@/lib/routing/sourceSlug";
import { buildCanonicalUrl } from "@/lib/seo/metadata";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [skillEntries, categorySlugs, agentSlugs, sourceEntries] = await Promise.all([
    getAllSkillSitemapEntries(),
    getAllCategorySlugs(),
    getAllAgentSlugs(),
    getAllSourceSitemapEntries(),
  ]);
  const staticLastModified = new Date("2026-03-14T00:00:00.000Z");
  const staticRoutes = [
    "",
    "/about",
    "/how-scores-work",
    "/moderation-policy",
    "/new",
    "/privacy",
    "/review-guidelines",
    "/terms",
    "/top-rated",
    "/trending",
  ];

  return [
    ...staticRoutes.map((pathname) => ({
      url: buildCanonicalUrl(pathname || "/"),
      lastModified: staticLastModified,
      changeFrequency: pathname ? ("weekly" as const) : ("daily" as const),
      priority: pathname ? 0.7 : 1,
    })),
    ...skillEntries.map((entry) => ({
      url: buildCanonicalUrl(`/skills/${entry.slug}`),
      lastModified: entry.lastModified ? new Date(entry.lastModified) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...categorySlugs.map((slug) => ({
      url: buildCanonicalUrl(`/categories/${slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...agentSlugs.map((slug) => ({
      url: buildCanonicalUrl(`/agents/${slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...sourceEntries
      .filter((entry) => entry.skillCount > 0)
      .map((entry) => ({
        url: buildCanonicalUrl(`/sources/${encodeSourceSlug(entry.slug)}`),
        changeFrequency: "weekly" as const,
        priority: entry.skillCount > 3 ? 0.7 : 0.5,
      })),
  ];
}

import type { MetadataRoute } from "next";

import {
  EMERGENCY_AGENT_RAIL,
  EMERGENCY_CATEGORIES,
  EMERGENCY_CATALOG_SNAPSHOT_AT,
  EMERGENCY_LEADERBOARD,
} from "@/lib/data/emergencyCatalog";
import { encodeSourceSlug } from "@/lib/routing/sourceSlug";
import { buildCanonicalUrl } from "@/lib/seo/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const snapshotDate = new Date(EMERGENCY_CATALOG_SNAPSHOT_AT);
  const staticRoutes = [
    { pathname: "/", priority: 1, changeFrequency: "daily" as const },
    { pathname: "/search", priority: 0.9, changeFrequency: "daily" as const },
    { pathname: "/about", priority: 0.4, changeFrequency: "monthly" as const },
    { pathname: "/how-scores-work", priority: 0.4, changeFrequency: "monthly" as const },
    { pathname: "/moderation-policy", priority: 0.4, changeFrequency: "monthly" as const },
    { pathname: "/privacy", priority: 0.4, changeFrequency: "monthly" as const },
    { pathname: "/review-guidelines", priority: 0.4, changeFrequency: "monthly" as const },
    { pathname: "/terms", priority: 0.4, changeFrequency: "monthly" as const },
  ];
  const sourceSlugs = Array.from(
    new Set(EMERGENCY_LEADERBOARD.map((skill) => skill.source.slug)),
  );

  return [
    ...staticRoutes.map((route) => ({
      url: buildCanonicalUrl(route.pathname),
      lastModified: snapshotDate,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...EMERGENCY_LEADERBOARD.map((skill) => ({
      url: buildCanonicalUrl(`/skills/${skill.slug}`),
      lastModified: snapshotDate,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...EMERGENCY_CATEGORIES.map((category) => ({
      url: buildCanonicalUrl(`/categories/${category.slug}`),
      lastModified: snapshotDate,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...EMERGENCY_AGENT_RAIL.map((agent) => ({
      url: buildCanonicalUrl(`/agents/${agent.slug}`),
      lastModified: snapshotDate,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...sourceSlugs.map((sourceSlug) => ({
      url: buildCanonicalUrl(`/sources/${encodeSourceSlug(sourceSlug)}`),
      lastModified: snapshotDate,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}

import type { MetadataRoute } from "next";

import { getAllAgentSlugs } from "@/lib/db/agents";
import { getAllCategorySlugs } from "@/lib/db/categories";
import { getAllSkillSitemapEntries } from "@/lib/db/skills";
import { getAllSourceSitemapEntries } from "@/lib/db/sourcePages";
import { encodeSourceSlug } from "@/lib/routing/sourceSlug";
import { buildCanonicalUrl } from "@/lib/seo/metadata";

function isMissingSupabaseConfigError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message === "SkillJury could not resolve the Supabase project URL from the environment." ||
    error.message === "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticLastModified = new Date("2026-03-14T00:00:00.000Z");
  const highPriorityStaticRoutes = [
    { pathname: "", priority: 1.0, changeFrequency: "daily" as const },
    { pathname: "/search", priority: 0.9, changeFrequency: "daily" as const },
    { pathname: "/top-rated", priority: 0.9, changeFrequency: "daily" as const },
    { pathname: "/trending", priority: 0.9, changeFrequency: "daily" as const },
    { pathname: "/new", priority: 0.9, changeFrequency: "daily" as const },
  ];
  const standardStaticRoutes = [
    "/about",
    "/how-scores-work",
    "/moderation-policy",
    "/privacy",
    "/review-guidelines",
    "/terms",
  ];
  let skillEntries: Awaited<ReturnType<typeof getAllSkillSitemapEntries>> = [];
  let categorySlugs: Awaited<ReturnType<typeof getAllCategorySlugs>> = [];
  let agentSlugs: Awaited<ReturnType<typeof getAllAgentSlugs>> = [];
  let sourceEntries: Awaited<ReturnType<typeof getAllSourceSitemapEntries>> = [];

  try {
    [skillEntries, categorySlugs, agentSlugs, sourceEntries] = await Promise.all([
      getAllSkillSitemapEntries(),
      getAllCategorySlugs(),
      getAllAgentSlugs(),
      getAllSourceSitemapEntries(),
    ]);
  } catch (error) {
    if (!isMissingSupabaseConfigError(error)) {
      throw error;
    }

    console.warn(
      "[sitemap] Supabase public environment variables are missing. Emitting static sitemap entries only.",
    );
  }

  return [
    ...highPriorityStaticRoutes.map((route) => ({
      url: buildCanonicalUrl(route.pathname || "/"),
      lastModified: staticLastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...standardStaticRoutes.map((pathname) => ({
      url: buildCanonicalUrl(pathname),
      lastModified: staticLastModified,
      changeFrequency: "monthly" as const,
      priority: 0.4,
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
      priority: 0.9,
    })),
    ...agentSlugs.map((slug) => ({
      url: buildCanonicalUrl(`/agents/${slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.9,
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

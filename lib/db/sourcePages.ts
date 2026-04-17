import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { cleanCatalogDescription, cleanCatalogLabel, labelFromSlug } from "@/lib/catalog/clean";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sanitizeExternalUrl } from "@/lib/utils/externalUrl";

export type BrowseSource = {
  id: number;
  name: string;
  slug: string;
  homepageUrl: string | null;
  attributionText: string | null;
  skillCount?: number;
};

export type SourceSitemapEntry = {
  skillCount: number;
  slug: string;
};

export async function getAllSources(): Promise<BrowseSource[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("sources")
    .select("id, name, slug, homepage_url, attribution_text")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id as number,
    name: cleanCatalogLabel(row.name as string, labelFromSlug(row.slug as string)),
    slug: row.slug as string,
    homepageUrl: sanitizeExternalUrl(row.homepage_url as string | null),
    attributionText: cleanCatalogDescription(row.attribution_text as string | null),
  }));
}

export async function getSourceBySlug(
  sourceSlug: string,
): Promise<BrowseSource | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("sources", `source-${sourceSlug}`);
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("sources")
    .select("id, name, slug, homepage_url, attribution_text")
    .eq("slug", sourceSlug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const { count, error: countError } = await supabase
    .from("skills")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")
    .eq("source_id", data.id);

  if (countError) {
    throw countError;
  }

  return {
    id: data.id as number,
    name: cleanCatalogLabel(data.name as string, labelFromSlug(data.slug as string)),
    slug: data.slug as string,
    homepageUrl: sanitizeExternalUrl(data.homepage_url as string | null),
    attributionText: cleanCatalogDescription(data.attribution_text as string | null),
    skillCount: count ?? 0,
  };
}

export async function getAllSourceSlugs(): Promise<string[]> {
  const sources = await getAllSources();
  return sources.map((source) => source.slug);
}

export async function getAllSourceSitemapEntries(): Promise<SourceSitemapEntry[]> {
  const supabase = createServerSupabaseClient();
  const [{ data: sourceRows, error: sourceError }, { data: skillRows, error: skillError }] =
    await Promise.all([
      supabase
        .from("sources")
        .select("id, slug")
        .eq("is_active", true)
        .order("slug", { ascending: true }),
      supabase
        .from("skills")
        .select("source_id")
        .eq("status", "active")
        .not("source_id", "is", null),
    ]);

  if (sourceError) {
    throw sourceError;
  }

  if (skillError) {
    throw skillError;
  }

  const skillCounts = new Map<number, number>();

  for (const row of skillRows ?? []) {
    const sourceId = row.source_id as number | null;

    if (!sourceId) {
      continue;
    }

    skillCounts.set(sourceId, (skillCounts.get(sourceId) ?? 0) + 1);
  }

  return (sourceRows ?? []).map((row) => ({
    slug: row.slug as string,
    skillCount: skillCounts.get(row.id as number) ?? 0,
  }));
}

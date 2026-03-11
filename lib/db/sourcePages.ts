import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type BrowseSource = {
  id: number;
  name: string;
  slug: string;
  homepageUrl: string | null;
  attributionText: string | null;
  skillCount?: number;
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
    name: row.name as string,
    slug: row.slug as string,
    homepageUrl: (row.homepage_url as string | null) ?? null,
    attributionText: (row.attribution_text as string | null) ?? null,
  }));
}

export async function getSourceBySlug(
  sourceSlug: string,
): Promise<BrowseSource | null> {
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
    name: data.name as string,
    slug: data.slug as string,
    homepageUrl: (data.homepage_url as string | null) ?? null,
    attributionText: (data.attribution_text as string | null) ?? null,
    skillCount: count ?? 0,
  };
}

export async function getAllSourceSlugs(): Promise<string[]> {
  const sources = await getAllSources();
  return sources.map((source) => source.slug);
}

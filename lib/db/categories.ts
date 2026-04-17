import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { cleanCatalogDescription, cleanCatalogLabel, labelFromSlug } from "@/lib/catalog/clean";
import type { SkillListItem } from "@/lib/db/skills";
import { searchSkills } from "@/lib/db/search";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type BrowseCategory = {
  description: string | null;
  id: number;
  lastUpdatedAt: string | null;
  name: string;
  reviewedSkillCount: number;
  skillCount: number;
  slug: string;
  topPicks: SkillListItem[];
};

export async function getAllCategories(): Promise<BrowseCategory[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, display_order")
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  const rows = data ?? [];
  const categories = await Promise.all(
    rows.map(async (row) => {
      const { count, error: countError } = await supabase
        .from("skill_categories")
        .select("*", { count: "exact", head: true })
        .eq("category_id", row.id);

      if (countError) {
        throw countError;
      }

      return {
        id: row.id as number,
        name: cleanCatalogLabel(row.name as string, labelFromSlug(row.slug as string)),
        slug: row.slug as string,
        description: cleanCatalogDescription(row.description as string | null),
        skillCount: count ?? 0,
        reviewedSkillCount: 0,
        lastUpdatedAt: null,
        topPicks: [],
      } satisfies BrowseCategory;
    }),
  );

  return categories;
}

async function getLatestCategorySignal(categoryId: number) {
  const supabase = createServerSupabaseClient();
  const [{ data: latestSyncData, error: latestSyncError }, { data: latestUpdateData, error: latestUpdateError }] =
    await Promise.all([
      supabase
        .from("skills")
        .select("last_synced_at, skill_categories!inner(category_id)")
        .eq("status", "active")
        .eq("skill_categories.category_id", categoryId)
        .order("last_synced_at", { ascending: false, nullsFirst: false })
        .limit(1),
      supabase
        .from("skills")
        .select("updated_at, skill_categories!inner(category_id)")
        .eq("status", "active")
        .eq("skill_categories.category_id", categoryId)
        .order("updated_at", { ascending: false, nullsFirst: false })
        .limit(1),
    ]);

  if (latestSyncError) {
    throw latestSyncError;
  }

  if (latestUpdateError) {
    throw latestUpdateError;
  }

  const candidates = [
    latestSyncData?.[0]?.last_synced_at as string | null | undefined,
    latestUpdateData?.[0]?.updated_at as string | null | undefined,
  ].filter((value): value is string => Boolean(value));

  if (candidates.length === 0) {
    return null;
  }

  return candidates.sort().at(-1) ?? null;
}

export async function getCategoryBySlug(
  categorySlug: string,
): Promise<BrowseCategory | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("categories", `category-${categorySlug}`);
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description")
    .eq("slug", categorySlug)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const categoryId = data.id as number;
  const [
    skillCountResult,
    reviewedSkillCountResult,
    topPicksResult,
    lastUpdatedAt,
  ] = await Promise.all([
    supabase
      .from("skill_categories")
      .select("*", { count: "exact", head: true })
      .eq("category_id", categoryId),
    supabase
      .from("skills")
      .select("id, skill_categories!inner(category_id)", {
        count: "exact",
        head: true,
      })
      .eq("status", "active")
      .eq("skill_categories.category_id", categoryId)
      .gt("approved_review_count", 0),
    searchSkills({
      categoryId,
      page: 1,
      pageSize: 3,
      sort: "top-rated",
    }),
    getLatestCategorySignal(categoryId),
  ]);

  if (skillCountResult.error) {
    throw skillCountResult.error;
  }

  if (reviewedSkillCountResult.error) {
    throw reviewedSkillCountResult.error;
  }

  return {
    id: categoryId,
    name: cleanCatalogLabel(data.name as string, labelFromSlug(data.slug as string)),
    slug: data.slug as string,
    description: cleanCatalogDescription(data.description as string | null),
    skillCount: skillCountResult.count ?? 0,
    reviewedSkillCount: reviewedSkillCountResult.count ?? 0,
    lastUpdatedAt,
    topPicks: topPicksResult.items,
  };
}

export async function getAllCategorySlugs(): Promise<string[]> {
  const categories = await getAllCategories();
  return categories.map((category) => category.slug);
}

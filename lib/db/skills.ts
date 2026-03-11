import "server-only";

import { isMissingRelationError, logDataAccessError } from "@/lib/db/errors";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type SkillCategory = {
  id: number;
  name: string;
  slug: string;
};

export type SkillListItem = {
  approvedReviewCount: number;
  canonicalSourceUrl: string;
  categories: SkillCategory[];
  confidenceAdjustedScore: number | null;
  firstSeenAt: string | null;
  id: number;
  installCommand: string | null;
  lastSyncedAt: string | null;
  name: string;
  overallScore: number | null;
  repository: {
    ownerName: string | null;
    repositoryName: string | null;
    repositoryUrl: string | null;
    stars: number | null;
  } | null;
  reviewCount: number;
  shortSummary: string | null;
  slug: string;
  source: {
    name: string;
    slug: string;
  } | null;
  sourceId: number | null;
  weeklyInstalls: number | null;
};

export type SkillDetail = SkillListItem & {
  agentInstallData: Array<{
    agentName: string;
    agentSlug: string;
    installCount: number;
    supportType: string;
  }>;
  claimed: boolean;
  documentationUrl: string | null;
  longDescription: string | null;
  totalInstalls: number | null;
};

export type SupabaseSkillRow = {
  approved_review_count?: number | null;
  canonical_source_url: string;
  claimed: boolean;
  confidence_adjusted_score?: number | null;
  documentation_url?: string | null;
  first_seen_at: string | null;
  id: number;
  install_command: string | null;
  last_synced_at?: string | null;
  long_description?: string | null;
  name: string;
  overall_score?: number | null;
  repositories:
    | {
        owner_name: string | null;
        repository_name: string | null;
        repository_url: string | null;
        stars: number | null;
      }
    | {
        owner_name: string | null;
        repository_name: string | null;
        repository_url: string | null;
        stars: number | null;
      }[]
    | null;
  review_count?: number | null;
  skill_agent_compatibility?:
    | Array<{
        install_count: number;
        support_type: string;
        agents:
          | {
              name: string;
              slug: string;
            }
          | {
              name: string;
              slug: string;
            }[]
          | null;
      }>
    | null;
  skill_categories?:
    | Array<{
        categories:
          | {
              id: number;
              name: string;
              slug: string;
            }
          | {
              id: number;
              name: string;
              slug: string;
            }[]
          | null;
      }>
    | null;
  short_summary: string | null;
  slug: string;
  source_id?: number | null;
  sources:
    | {
        name: string;
        slug: string;
      }
    | {
        name: string;
        slug: string;
      }[]
    | null;
  total_installs?: number | null;
  weekly_installs: number | null;
};

function coerceObject<T>(value: T | T[] | null | undefined): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? value[0] ?? null : value;
}

export function normalizeSkillRow(row: SupabaseSkillRow): SkillDetail {
  const source = coerceObject(row.sources);
  const repository = coerceObject(row.repositories);
  const categories =
    row.skill_categories?.flatMap((entry) => {
      const category = coerceObject(entry.categories);

      if (!category) {
        return [];
      }

      return [
        {
          id: category.id,
          name: category.name,
          slug: category.slug,
        },
      ];
    }) ?? [];

  return {
    id: row.id,
    sourceId: row.source_id ?? null,
    name: row.name,
    slug: row.slug,
    shortSummary: row.short_summary ?? null,
    longDescription: row.long_description ?? null,
    installCommand: row.install_command ?? null,
    canonicalSourceUrl: row.canonical_source_url,
    documentationUrl: row.documentation_url ?? null,
    weeklyInstalls: row.weekly_installs ?? null,
    totalInstalls: row.total_installs ?? null,
    firstSeenAt: row.first_seen_at ?? null,
    lastSyncedAt: row.last_synced_at ?? null,
    reviewCount: row.review_count ?? 0,
    approvedReviewCount: row.approved_review_count ?? 0,
    overallScore:
      typeof row.overall_score === "number"
        ? row.overall_score
        : row.overall_score === null || row.overall_score === undefined
          ? null
          : Number(row.overall_score),
    confidenceAdjustedScore:
      typeof row.confidence_adjusted_score === "number"
        ? row.confidence_adjusted_score
        : row.confidence_adjusted_score === null ||
            row.confidence_adjusted_score === undefined
          ? null
          : Number(row.confidence_adjusted_score),
    claimed: row.claimed,
    categories,
    source: source
      ? {
          name: source.name,
          slug: source.slug,
        }
      : null,
    repository: repository
      ? {
          ownerName: repository.owner_name ?? null,
          repositoryName: repository.repository_name ?? null,
          repositoryUrl: repository.repository_url ?? null,
          stars: repository.stars ?? null,
        }
      : null,
    agentInstallData:
      row.skill_agent_compatibility?.flatMap((compatibility) => {
        const agent = coerceObject(compatibility.agents);

        if (!agent) {
          return [];
        }

        return [
          {
            agentName: agent.name,
            agentSlug: agent.slug,
            installCount: compatibility.install_count ?? 0,
            supportType: compatibility.support_type,
          },
        ];
      }) ?? [],
  };
}

function buildSkillSelect() {
  return `
    id,
    source_id,
    name,
    slug,
    short_summary,
    long_description,
    install_command,
    canonical_source_url,
    documentation_url,
    weekly_installs,
    total_installs,
    first_seen_at,
    last_synced_at,
    review_count,
    approved_review_count,
    overall_score,
    confidence_adjusted_score,
    claimed,
    sources(name, slug),
    repositories(owner_name, repository_name, repository_url, stars),
    skill_categories(
      categories(id, name, slug)
    ),
    skill_agent_compatibility(
      install_count,
      support_type,
      agents(name, slug)
    )
  `;
}

export async function getFeaturedSkills(limit = 6): Promise<SkillListItem[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("skills")
    .select(buildSkillSelect())
    .eq("status", "active")
    .order("confidence_adjusted_score", { ascending: false, nullsFirst: false })
    .order("overall_score", { ascending: false, nullsFirst: false })
    .order("weekly_installs", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) {
    logDataAccessError("featured-skills", error);

    if (isMissingRelationError(error.message)) {
      return [];
    }

    throw error;
  }

  return ((data ?? []) as unknown as SupabaseSkillRow[]).map((row) =>
    normalizeSkillRow(row),
  );
}

export async function getSkillBySlug(
  skillSlug: string,
): Promise<SkillDetail | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("skills")
    .select(buildSkillSelect())
    .eq("slug", skillSlug)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    logDataAccessError("skill-detail", error);

    if (isMissingRelationError(error.message)) {
      return null;
    }

    throw error;
  }

  if (!data) {
    return null;
  }

  return normalizeSkillRow(data as unknown as SupabaseSkillRow);
}

export async function getAllSkillSlugs(): Promise<string[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("skills")
    .select("slug")
    .eq("status", "active")
    .order("weekly_installs", { ascending: false, nullsFirst: false });

  if (error) {
    logDataAccessError("skill-slugs", error);

    if (isMissingRelationError(error.message)) {
      return [];
    }

    throw error;
  }

  return data.map((item) => item.slug);
}

export async function getSkillCount() {
  const supabase = createServerSupabaseClient();
  const { count, error } = await supabase
    .from("skills")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  if (error) {
    logDataAccessError("skill-count", error);

    if (isMissingRelationError(error.message)) {
      return 0;
    }

    throw error;
  }

  return count ?? 0;
}

export async function getRelatedSkillsBySource(
  sourceId: number,
  currentSkillSlug: string,
  limit = 4,
): Promise<SkillListItem[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("skills")
    .select(buildSkillSelect())
    .eq("status", "active")
    .eq("source_id", sourceId)
    .neq("slug", currentSkillSlug)
    .order("confidence_adjusted_score", { ascending: false, nullsFirst: false })
    .order("overall_score", { ascending: false, nullsFirst: false })
    .order("weekly_installs", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) {
    logDataAccessError("related-skills", error);

    if (isMissingRelationError(error.message)) {
      return [];
    }

    throw error;
  }

  return ((data ?? []) as unknown as SupabaseSkillRow[]).map((row) =>
    normalizeSkillRow(row),
  );
}

export async function getRelatedSkillsByCategory(
  categoryId: number,
  currentSkillSlug: string,
  limit = 4,
): Promise<SkillListItem[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("skills")
    .select(
      `
        ${buildSkillSelect()},
        matched_skill_categories:skill_categories!inner(category_id)
      `,
    )
    .eq("status", "active")
    .eq("matched_skill_categories.category_id", categoryId)
    .neq("slug", currentSkillSlug)
    .order("confidence_adjusted_score", { ascending: false, nullsFirst: false })
    .order("overall_score", { ascending: false, nullsFirst: false })
    .order("weekly_installs", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) {
    logDataAccessError("related-category-skills", error);

    if (isMissingRelationError(error.message)) {
      return [];
    }

    throw error;
  }

  return ((data ?? []) as unknown as SupabaseSkillRow[]).map((row) =>
    normalizeSkillRow(row),
  );
}

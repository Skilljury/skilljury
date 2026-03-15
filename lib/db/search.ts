import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  normalizeSkillRow,
  type SkillListItem,
  type SupabaseSkillRow,
} from "@/lib/db/skills";

export type SearchSort =
  | "popular"
  | "newest"
  | "alphabetical"
  | "top-rated"
  | "trending";

export type SearchSkillsInput = {
  query?: string | null;
  categoryId?: number | null;
  categorySlug?: string | null;
  sourceId?: number | null;
  sourceSlug?: string | null;
  agentId?: number | null;
  agentSlug?: string | null;
  page?: number;
  pageSize?: number;
  sort?: SearchSort;
};

export type PaginatedSkillResults = {
  items: SkillListItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  sort: SearchSort;
};

function buildListSelect(categoryJoinMode: "" | "!inner") {
  return `
    id,
    source_id,
    name,
    slug,
    short_summary,
    install_command,
    canonical_source_url,
    weekly_installs,
    first_seen_at,
    last_synced_at,
    claimed,
    review_count,
    approved_review_count,
    overall_score,
    confidence_adjusted_score,
    sources(name, slug),
    repositories(owner_name, repository_name, repository_url, stars),
    skill_categories${categoryJoinMode}(
      category_id,
      categories(id, name, slug)
    )
  `;
}

function normalizePage(page?: number, fallback = 1) {
  if (!page || Number.isNaN(page) || page < 1) {
    return fallback;
  }

  return Math.floor(page);
}

function normalizePageSize(pageSize?: number, fallback = 24) {
  if (!pageSize || Number.isNaN(pageSize) || pageSize < 1) {
    return fallback;
  }

  return Math.min(Math.floor(pageSize), 48);
}

function sanitizeSearchTerm(value: string) {
  return value.replace(/[%_,().:]/g, " ").replace(/\s+/g, " ").trim();
}

export async function searchSkills(
  input: SearchSkillsInput,
): Promise<PaginatedSkillResults> {
  const supabase = createServerSupabaseClient();
  const page = normalizePage(input.page);
  const pageSize = normalizePageSize(input.pageSize);
  const sort = input.sort ?? "popular";
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("skills")
    .select(
      `
        ${buildListSelect(input.categoryId ? "!inner" : "")},
        matched_skill_agent_compatibility:skill_agent_compatibility${input.agentId ? "!inner" : ""}(agent_id)
      `,
      { count: "exact" },
    )
    .eq("status", "active");

  if (input.sourceId) {
    query = query.eq("source_id", input.sourceId);
  }

  if (input.categoryId) {
    query = query.eq("skill_categories.category_id", input.categoryId);
  }

  if (input.agentId) {
    query = query.eq("matched_skill_agent_compatibility.agent_id", input.agentId);
  }

  const sanitizedQuery = input.query ? sanitizeSearchTerm(input.query) : "";

  if (sanitizedQuery) {
    query = query.or(
      `name.ilike.%${sanitizedQuery}%,short_summary.ilike.%${sanitizedQuery}%,long_description.ilike.%${sanitizedQuery}%`,
    );
  }

  switch (sort) {
    case "alphabetical":
      query = query.order("name", { ascending: true });
      break;
    case "newest":
      query = query
        .order("first_seen_at", { ascending: false, nullsFirst: false })
        .order("weekly_installs", { ascending: false, nullsFirst: false })
        .order("name", { ascending: true });
      break;
    case "top-rated":
      query = query
        .order("confidence_adjusted_score", {
          ascending: false,
          nullsFirst: false,
        })
        .order("overall_score", { ascending: false, nullsFirst: false })
        .order("weekly_installs", { ascending: false, nullsFirst: false })
        .order("name", { ascending: true });
      break;
    case "trending":
      query = query
        .order("weekly_installs", { ascending: false, nullsFirst: false })
        .order("first_seen_at", { ascending: false, nullsFirst: false })
        .order("name", { ascending: true });
      break;
    case "popular":
    default:
      query = query
        .order("weekly_installs", { ascending: false, nullsFirst: false })
        .order("name", { ascending: true });
      break;
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw error;
  }

  return {
    items: ((data ?? []) as unknown as SupabaseSkillRow[]).map((row) =>
      normalizeSkillRow(row),
    ),
    page,
    pageSize,
    totalCount: count ?? 0,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
    sort,
  };
}

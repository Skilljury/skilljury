import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import {
  cleanCatalogDescription,
  cleanCatalogLabel,
  cleanCatalogSummary,
  isGenericCatalogName,
  isMeaningfulCatalogSummary,
  isSuspiciousCatalogLabel,
  labelFromSlug,
} from "@/lib/catalog/clean";
import { isMissingRelationError, logDataAccessError } from "@/lib/db/errors";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sanitizeExternalUrl } from "@/lib/utils/externalUrl";

export type SkillCategory = {
  id: number;
  name: string;
  slug: string;
};

export type SkillSecurityAuditStatus =
  | "critical"
  | "fail"
  | "high_risk"
  | "pass"
  | "safe"
  | "warn";

export type SkillSecurityAudits = {
  gen?: SkillSecurityAuditStatus | null;
  scraped_at?: string | null;
  snyk?: SkillSecurityAuditStatus | null;
  socket?: SkillSecurityAuditStatus | null;
};

export type LeaderboardTab = "all" | "hot" | "trending";

export type SkillListItem = {
  approvedReviewCount: number;
  canonicalSourceUrl: string | null;
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
  securityAudits: SkillSecurityAudits;
  totalInstalls: number | null;
};

export type SkillSitemapEntry = {
  approvedReviewCount: number;
  lastModified: string | null;
  slug: string;
};

export type LeaderboardSkill = {
  createdAt: string | null;
  id: number;
  installCountLabel: string;
  name: string;
  securityAudits: SkillSecurityAudits;
  slug: string;
  source: {
    name: string;
    slug: string;
  } | null;
  weeklyInstalls: number | null;
};

export type LeaderboardResult = {
  items: LeaderboardSkill[];
  page: number;
  pageSize: number;
  tab: LeaderboardTab;
  total: number;
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
  security_audits?: SkillSecurityAudits | null;
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

type SupabaseLeaderboardSkillRow = {
  created_at?: string | null;
  id: number;
  name: string;
  security_audits?: SkillSecurityAudits | null;
  slug: string;
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
  weekly_installs: number | null;
};

function coerceObject<T>(value: T | T[] | null | undefined): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? value[0] ?? null : value;
}

function isFeaturedSkillCandidate(skill: SkillListItem) {
  const hasStrongSignals =
    skill.approvedReviewCount > 0 ||
    (skill.weeklyInstalls ?? 0) >= 250 ||
    (skill.repository?.stars ?? 0) >= 25;

  return (
    !isGenericCatalogName(skill.name) &&
    isMeaningfulCatalogSummary(skill.shortSummary) &&
    hasStrongSignals &&
    skill.categories.length > 0 &&
    Boolean(skill.source)
  );
}

function pickDiverseFeaturedSkills(
  skills: SkillListItem[],
  limit: number,
): SkillListItem[] {
  const buckets = new Map<string, SkillListItem[]>();

  for (const skill of skills) {
    const key = skill.source?.slug ?? `source-${skill.sourceId ?? skill.id}`;
    const existing = buckets.get(key);

    if (existing) {
      existing.push(skill);
      continue;
    }

    buckets.set(key, [skill]);
  }

  const selected: SkillListItem[] = [];
  let roundIndex = 0;

  while (selected.length < limit) {
    let addedThisRound = 0;

    for (const bucket of buckets.values()) {
      const candidate = bucket[roundIndex];

      if (!candidate) {
        continue;
      }

      selected.push(candidate);
      addedThisRound += 1;

      if (selected.length >= limit) {
        break;
      }
    }

    if (addedThisRound === 0) {
      break;
    }

    roundIndex += 1;
  }

  return selected;
}

function normalizeSecurityAuditStatus(
  value: unknown,
): SkillSecurityAuditStatus | null {
  if (typeof value !== "string") {
    return null;
  }

  switch (value) {
    case "critical":
    case "fail":
    case "high_risk":
    case "pass":
    case "safe":
    case "warn":
      return value;
    default:
      return null;
  }
}

function normalizeSecurityAudits(
  value: SkillSecurityAudits | null | undefined,
): SkillSecurityAudits {
  return {
    gen: normalizeSecurityAuditStatus(value?.gen),
    socket: normalizeSecurityAuditStatus(value?.socket),
    snyk: normalizeSecurityAuditStatus(value?.snyk),
    scraped_at: typeof value?.scraped_at === "string" ? value.scraped_at : null,
  };
}

function formatCompactNumber(value: number) {
  return value.toFixed(value >= 100 ? 0 : 1).replace(/\.0$/, "");
}

export function formatInstallCount(value: number | null | undefined) {
  if (!value || value <= 0) {
    return "0";
  }

  if (value >= 1_000_000) {
    return `${formatCompactNumber(value / 1_000_000)}M`;
  }

  if (value >= 1_000) {
    return `${formatCompactNumber(value / 1_000)}K`;
  }

  return value.toLocaleString("en-US");
}

function buildLeaderboardSelect() {
  return `
    id,
    slug,
    name,
    weekly_installs,
    created_at,
    security_audits,
    sources(name, slug)
  `;
}

function normalizeLeaderboardRow(
  row: SupabaseLeaderboardSkillRow,
): LeaderboardSkill {
  const source = coerceObject(row.sources);

  return {
    id: row.id,
    slug: row.slug,
    name: cleanCatalogLabel(row.name, labelFromSlug(row.slug)),
    weeklyInstalls: row.weekly_installs ?? null,
    installCountLabel: formatInstallCount(row.weekly_installs ?? null),
    createdAt: row.created_at ?? null,
    securityAudits: normalizeSecurityAudits(row.security_audits),
    source: source
      ? {
          name: cleanCatalogLabel(source.name, labelFromSlug(source.slug)),
          slug: source.slug,
        }
      : null,
  };
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
          name: cleanCatalogLabel(category.name, labelFromSlug(category.slug)),
          slug: category.slug,
        },
      ];
    }) ?? [];

  return {
    id: row.id,
    sourceId: row.source_id ?? null,
    name: cleanCatalogLabel(row.name, labelFromSlug(row.slug)),
    slug: row.slug,
    shortSummary: cleanCatalogSummary(row.short_summary),
    longDescription: cleanCatalogDescription(row.long_description, row.short_summary),
    installCommand: row.install_command ?? null,
    canonicalSourceUrl: sanitizeExternalUrl(row.canonical_source_url),
    documentationUrl: sanitizeExternalUrl(row.documentation_url ?? null),
    securityAudits: normalizeSecurityAudits(row.security_audits),
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
          name: cleanCatalogLabel(source.name, labelFromSlug(source.slug)),
          slug: source.slug,
        }
      : null,
    repository: repository
      ? {
          ownerName: repository.owner_name
            ? cleanCatalogLabel(repository.owner_name, repository.owner_name)
            : null,
          repositoryName: repository.repository_name
            ? cleanCatalogLabel(repository.repository_name, repository.repository_name)
            : null,
          repositoryUrl: sanitizeExternalUrl(repository.repository_url ?? null),
          stars: repository.stars ?? null,
        }
      : null,
    agentInstallData:
      row.skill_agent_compatibility?.flatMap((compatibility) => {
        const agent = coerceObject(compatibility.agents);

        if (!agent) {
          return [];
        }

        if (isSuspiciousCatalogLabel(agent.name)) {
          return [];
        }

        return [
          {
            agentName: cleanCatalogLabel(agent.name, labelFromSlug(agent.slug)),
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
    security_audits,
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
  "use cache";
  cacheLife("hours");
  cacheTag("skills", "skills-featured");
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("skills")
    .select(buildSkillSelect())
    .eq("status", "active")
    .order("confidence_adjusted_score", { ascending: false, nullsFirst: false })
    .order("overall_score", { ascending: false, nullsFirst: false })
    .order("weekly_installs", { ascending: false, nullsFirst: false })
    .limit(Math.max(limit * 10, 60));

  if (error) {
    logDataAccessError("featured-skills", error);

    if (isMissingRelationError(error.message)) {
      return [];
    }

    throw error;
  }

  const normalized = ((data ?? []) as unknown as SupabaseSkillRow[]).map((row) =>
    normalizeSkillRow(row),
  );
  const featured = pickDiverseFeaturedSkills(
    normalized.filter(isFeaturedSkillCandidate),
    limit,
  );

  return featured;
}

export async function getSkillBySlug(
  skillSlug: string,
): Promise<SkillDetail | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("skills", `skill-${skillSlug}`);
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

export async function getAllSkillSitemapEntries(): Promise<SkillSitemapEntry[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("skills", "skills-sitemap");
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("skills")
    .select("slug, approved_review_count, last_synced_at, updated_at")
    .eq("status", "active")
    .order("weekly_installs", { ascending: false, nullsFirst: false });

  if (error) {
    logDataAccessError("skill-slugs", error);

    if (isMissingRelationError(error.message)) {
      return [];
    }

    throw error;
  }

  return (data ?? []).map((item) => ({
    slug: item.slug,
    approvedReviewCount: item.approved_review_count ?? 0,
    lastModified: item.last_synced_at ?? item.updated_at ?? null,
  }));
}

export async function getAllSkillSlugs(): Promise<string[]> {
  const entries = await getAllSkillSitemapEntries();
  return entries.map((entry) => entry.slug);
}

export async function getSkillCount() {
  "use cache";
  cacheLife("hours");
  cacheTag("skills", "skills-count");
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

export async function getLeaderboardSkills(
  tab: LeaderboardTab,
  page: number,
  pageSize: number,
): Promise<LeaderboardResult> {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safePageSize =
    Number.isFinite(pageSize) && pageSize > 0 ? Math.min(Math.floor(pageSize), 50) : 25;
  const start = (safePage - 1) * safePageSize;
  const end = start + safePageSize - 1;
  const supabase = createServerSupabaseClient();
  const trendingCutoff = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();
  let countQuery = supabase
    .from("skills")
    .select("id", { count: "exact", head: true })
    .eq("status", "active");
  let dataQuery = supabase
    .from("skills")
    .select(buildLeaderboardSelect())
    .eq("status", "active")
    .range(start, end);

  if (tab === "trending") {
    countQuery = countQuery.gte("last_synced_at", trendingCutoff);
    dataQuery = dataQuery
      .gte("last_synced_at", trendingCutoff)
      .order("weekly_installs", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false, nullsFirst: false });
  } else if (tab === "hot") {
    dataQuery = dataQuery
      .order("created_at", { ascending: false, nullsFirst: false })
      .order("weekly_installs", { ascending: false, nullsFirst: false });
  } else {
    dataQuery = dataQuery
      .order("weekly_installs", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false, nullsFirst: false });
  }

  const [{ count, error: countError }, { data, error: dataError }] = await Promise.all([
    countQuery,
    dataQuery,
  ]);

  if (countError) {
    logDataAccessError("leaderboard-count", countError);

    if (isMissingRelationError(countError.message)) {
      return {
        tab,
        page: safePage,
        pageSize: safePageSize,
        total: 0,
        items: [],
      };
    }

    throw countError;
  }

  if (dataError) {
    logDataAccessError("leaderboard-items", dataError);

    if (isMissingRelationError(dataError.message)) {
      return {
        tab,
        page: safePage,
        pageSize: safePageSize,
        total: count ?? 0,
        items: [],
      };
    }

    throw dataError;
  }

  return {
    tab,
    page: safePage,
    pageSize: safePageSize,
    total: count ?? 0,
    items: ((data ?? []) as unknown as SupabaseLeaderboardSkillRow[]).map(
      normalizeLeaderboardRow,
    ),
  };
}

export async function getRelatedSkillsBySource(
  sourceId: number,
  currentSkillSlug: string,
  limit = 4,
): Promise<SkillListItem[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("skills", "skills-related", `skills-source-${sourceId}`);
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
  "use cache";
  cacheLife("hours");
  cacheTag("skills", "skills-related", `skills-category-${categoryId}`);
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

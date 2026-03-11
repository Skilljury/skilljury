import { createHash } from "node:crypto";

import type { SupabaseClient } from "@supabase/supabase-js";

import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import {
  fetchSkillPageHtml,
  fetchSkillsShSitemap,
  parseSkillsShSkillPage,
  type ParsedSkillPage,
} from "@/lib/ingestion/skillsShParser";
import { getGitHubRepositoryMeta } from "@/lib/ingestion/githubRepoMeta";
import {
  classifySkillCategories,
  skillCategoryDefinitions,
} from "@/lib/taxonomy/categories";

type SyncTrigger = "manual" | "cron";

type SyncOptions = {
  trigger: SyncTrigger;
  limit?: number;
};

type SnapshotFile = {
  path: string;
  body: string;
  contentType: string;
};

type ParsedRecord = {
  skill: ParsedSkillPage;
  rawHtml: string;
  repositoryMeta: Awaited<ReturnType<typeof getGitHubRepositoryMeta>>;
};

type SyncSummary = {
  status: "completed" | "failed";
  trigger: SyncTrigger;
  itemsFound: number;
  itemsCreated: number;
  itemsUpdated: number;
  errorsCount: number;
  rawSnapshotPath: string | null;
};

const PAGE_FETCH_CONCURRENCY = 16;
const SNAPSHOT_PAGE_CHUNK_SIZE = 100;
const SNAPSHOT_PARSED_CHUNK_SIZE = 250;
const BATCH_WRITE_SIZE = 1000;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildRunPrefix() {
  const now = new Date();
  const iso = now.toISOString().replace(/[:.]/g, "-");

  return `skills-sh/${iso}`;
}

async function ensureSyncBucket(supabase: SupabaseClient) {
  const { data: buckets, error } = await supabase.storage.listBuckets();

  if (error) {
    throw new Error(`Failed to list storage buckets: ${error.message}`);
  }

  const existing = buckets.find((bucket) => bucket.name === "sync-raw");

  if (!existing) {
    const { error: createError } = await supabase.storage.createBucket(
      "sync-raw",
      {
        public: false,
        fileSizeLimit: 50 * 1024 * 1024,
      },
    );

    if (createError) {
      throw new Error(`Failed to create sync-raw bucket: ${createError.message}`);
    }
  }
}

async function uploadSnapshotFiles(
  supabase: SupabaseClient,
  files: SnapshotFile[],
): Promise<string> {
  await ensureSyncBucket(supabase);

  for (const file of files) {
    const { error } = await supabase.storage
      .from("sync-raw")
      .upload(file.path, file.body, {
        contentType: file.contentType,
        upsert: true,
      });

    if (error) {
      throw new Error(`Failed to upload ${file.path}: ${error.message}`);
    }
  }

  const topLevelPaths = new Set(
    files.map((file) => file.path.split("/").slice(0, 2).join("/")),
  );

  return [...topLevelPaths][0] ?? files[0]?.path ?? "";
}

async function startSyncRun(supabase: SupabaseClient, trigger: SyncTrigger) {
  const { data, error } = await supabase
    .from("sync_runs")
    .insert({
      status: "running",
      notes: `Phase 1 ${trigger} sync from skills.sh`,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(
      `Failed to create sync run. Apply the SQL migrations first. ${error.message}`,
    );
  }

  return data.id as number;
}

async function finishSyncRun(
  supabase: SupabaseClient,
  syncRunId: number,
  patch: {
    status: "completed" | "failed";
    itemsFound: number;
    itemsCreated: number;
    itemsUpdated: number;
    errorsCount: number;
    rawSnapshotPath: string | null;
    notes: string;
  },
) {
  const { error } = await supabase
    .from("sync_runs")
    .update({
      status: patch.status,
      items_found: patch.itemsFound,
      items_created: patch.itemsCreated,
      items_updated: patch.itemsUpdated,
      errors_count: patch.errorsCount,
      raw_snapshot_path: patch.rawSnapshotPath,
      notes: patch.notes,
      completed_at: new Date().toISOString(),
    })
    .eq("id", syncRunId);

  if (error) {
    throw new Error(`Failed to finalize sync run ${syncRunId}: ${error.message}`);
  }
}

async function upsertSources(
  supabase: SupabaseClient,
  records: ParsedRecord[],
  syncedAt: string,
) {
  const sourceMap = new Map<string, ParsedRecord>();

  for (const record of records) {
    sourceMap.set(record.skill.sourceSlug, record);
  }

  const sourceRows = [...sourceMap.values()].map((record) => ({
    name: record.skill.sourceName,
    slug: record.skill.sourceSlug,
    source_type: "repository",
    homepage_url:
      record.repositoryMeta?.repositoryUrl ??
      record.skill.repositoryUrl ??
      `https://skills.sh/${record.skill.sourceSlug}`,
    attribution_text: "Imported from skills.sh",
    last_synced_at: syncedAt,
    sync_notes: "Phase 1 catalog bootstrap",
    is_active: true,
  }));

  const { data, error } = await supabase
    .from("sources")
    .upsert(sourceRows, { onConflict: "slug" })
    .select("id, slug");

  if (error) {
    throw new Error(`Failed to upsert sources: ${error.message}`);
  }

  return new Map(data.map((row) => [row.slug as string, row.id as number]));
}

async function upsertRepositories(
  supabase: SupabaseClient,
  records: ParsedRecord[],
  sourceIds: Map<string, number>,
  syncedAt: string,
) {
  const repositoryMap = new Map<
    string,
    {
      source_id: number | null;
      owner_name: string | null;
      repository_name: string | null;
      repository_url: string;
      default_branch: string | null;
      license: string | null;
      stars: number;
      forks: number;
      open_issues_count: number;
      last_pushed_at: string | null;
      readme_excerpt: string | null;
      repo_topics: string[];
      last_repo_sync_at: string;
    }
  >();

  for (const record of records) {
      const repositoryMeta = record.repositoryMeta;
      const repositoryUrl =
        repositoryMeta?.repositoryUrl ?? record.skill.repositoryUrl;

      if (!repositoryUrl) {
        continue;
      }

      const [ownerName, repositoryName] = repositoryUrl
        .replace("https://github.com/", "")
        .split("/");

      repositoryMap.set(repositoryUrl, {
        source_id: sourceIds.get(record.skill.sourceSlug) ?? null,
        owner_name: repositoryMeta?.ownerName ?? ownerName,
        repository_name: repositoryMeta?.repositoryName ?? repositoryName,
        repository_url: repositoryUrl,
        default_branch: repositoryMeta?.defaultBranch ?? null,
        license: repositoryMeta?.license ?? null,
        stars: repositoryMeta?.stars ?? record.skill.githubStars ?? 0,
        forks: repositoryMeta?.forks ?? 0,
        open_issues_count: repositoryMeta?.openIssuesCount ?? 0,
        last_pushed_at: repositoryMeta?.lastPushedAt ?? null,
        readme_excerpt:
          repositoryMeta?.readmeExcerpt ?? record.skill.shortSummary ?? null,
        repo_topics: repositoryMeta?.repoTopics ?? [],
        last_repo_sync_at: syncedAt,
      });
  }

  const repositoryRows = [...repositoryMap.values()];

  if (repositoryRows.length === 0) {
    return new Map<string, number>();
  }

  const { data, error } = await supabase
    .from("repositories")
    .upsert(repositoryRows, { onConflict: "repository_url" })
    .select("id, repository_url");

  if (error) {
    throw new Error(`Failed to upsert repositories: ${error.message}`);
  }

  return new Map(
    data.map((row) => [row.repository_url as string, row.id as number]),
  );
}

async function fetchExistingSkillSlugs(supabase: SupabaseClient) {
  const pageSize = 1_000;
  const rows: Array<{
    slug: string;
    source_id: number;
    source_skill_id: string;
  }> = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase
      .from("skills")
      .select("slug, source_id, source_skill_id")
      .order("id", { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (error) {
      throw new Error(
        `Failed to fetch existing skills: ${
          error.message || JSON.stringify(error)
        }`,
      );
    }

    const pageRows = (data ?? []) as Array<{
      slug: string;
      source_id: number;
      source_skill_id: string;
    }>;

    rows.push(...pageRows);

    if (pageRows.length < pageSize) {
      break;
    }

    offset += pageSize;
  }

  return {
    byIdentity: new Map(
      rows.map((row) => [
        `${row.source_id}:${row.source_skill_id}`,
        row.slug,
      ]),
    ),
    usedSlugs: new Set(rows.map((row) => row.slug)),
  };
}

function buildSkillSlug(
  baseSlug: string,
  sourceSlug: string,
  existingIdentityMap: Map<string, string>,
  usedSlugs: Set<string>,
  sourceId: number,
  sourceSkillId: string,
) {
  const identityKey = `${sourceId}:${sourceSkillId}`;
  const existingSlug = existingIdentityMap.get(identityKey);

  if (existingSlug) {
    return existingSlug;
  }

  if (!usedSlugs.has(baseSlug)) {
    usedSlugs.add(baseSlug);
    return baseSlug;
  }

  const sourceSegments = sourceSlug.split("/");
  const candidates = [
    `${baseSlug}--${slugify(sourceSegments.at(-1) ?? sourceSlug)}`,
    `${baseSlug}--${slugify(sourceSegments.join("-"))}`,
  ];

  for (const candidate of candidates) {
    if (!usedSlugs.has(candidate)) {
      usedSlugs.add(candidate);
      return candidate;
    }
  }

  const digest = createHash("sha1").update(identityKey).digest("hex").slice(0, 6);
  const fallback = `${baseSlug}--${digest}`;
  usedSlugs.add(fallback);
  return fallback;
}

async function upsertSkills(
  supabase: SupabaseClient,
  records: ParsedRecord[],
  sourceIds: Map<string, number>,
  repositoryIds: Map<string, number>,
  syncedAt: string,
) {
  const existing = await fetchExistingSkillSlugs(supabase);

  const skillRows = records.map((record) => {
    const sourceId = sourceIds.get(record.skill.sourceSlug);

    if (!sourceId) {
      throw new Error(`Missing source ID for ${record.skill.sourceSlug}`);
    }

    const repositoryUrl =
      record.repositoryMeta?.repositoryUrl ?? record.skill.repositoryUrl;
    const repositoryId = repositoryUrl
      ? repositoryIds.get(repositoryUrl) ?? null
      : null;
    const slug = buildSkillSlug(
      record.skill.slugBase,
      record.skill.sourceSlug,
      existing.byIdentity,
      existing.usedSlugs,
      sourceId,
      record.skill.sourceSkillId,
    );

    return {
      source_id: sourceId,
      repository_id: repositoryId,
      source_skill_id: record.skill.sourceSkillId,
      name: record.skill.name,
      slug,
      short_summary: record.skill.shortSummary,
      long_description: record.skill.longDescription,
      canonical_source_url: record.skill.canonicalSourceUrl,
      repository_url: repositoryUrl,
      documentation_url: record.repositoryMeta?.homepageUrl ?? null,
      install_command: record.skill.installCommand,
      status: "active",
      first_seen_at: record.skill.firstSeenAt,
      last_synced_at: syncedAt,
      weekly_installs: record.skill.weeklyInstalls ?? 0,
      total_installs: null,
      claimed: false,
    };
  });

  const skillIds = new Map<string, number>();

  for (let index = 0; index < skillRows.length; index += BATCH_WRITE_SIZE) {
    const chunk = skillRows.slice(index, index + BATCH_WRITE_SIZE);
    const { data, error } = await supabase
      .from("skills")
      .upsert(chunk, { onConflict: "canonical_source_url" })
      .select("id, canonical_source_url");

    if (error) {
      throw new Error(`Failed to upsert skills: ${error.message}`);
    }

    for (const row of data ?? []) {
      skillIds.set(
        row.canonical_source_url as string,
        row.id as number,
      );
    }
  }

  return skillIds;
}

async function upsertAgentsAndCompatibility(
  supabase: SupabaseClient,
  records: ParsedRecord[],
  skillIds: Map<string, number>,
  syncedAt: string,
) {
  const agentRows = new Map<
    string,
    {
      name: string;
      slug: string;
      status: string;
      short_description: string;
    }
  >();

  for (const record of records) {
    for (const agent of record.skill.installedAgents) {
      agentRows.set(agent.slug, {
        name: agent.name,
        slug: agent.slug,
        status: "active",
        short_description: "Detected from skills.sh install distribution data.",
      });
    }
  }

  if (agentRows.size === 0) {
    return;
  }

  const { data: agentData, error: agentError } = await supabase
    .from("agents")
    .upsert([...agentRows.values()], { onConflict: "slug" })
    .select("id, slug");

  if (agentError) {
    throw new Error(`Failed to upsert agents: ${agentError.message}`);
  }

  const agentIds = new Map(
    agentData.map((row) => [row.slug as string, row.id as number]),
  );

  const compatibilityRows = records.flatMap((record) => {
    const skillId = skillIds.get(record.skill.canonicalSourceUrl);

    if (!skillId) {
      return [];
    }

    return record.skill.installedAgents.flatMap((agent) => {
      const agentId = agentIds.get(agent.slug);

      if (!agentId) {
        return [];
      }

      return [
        {
          skill_id: skillId,
          agent_id: agentId,
          support_type: "listed by source",
          install_count: agent.installCount,
          last_confirmed_at: syncedAt,
        },
      ];
    });
  });

  if (compatibilityRows.length === 0) {
    return;
  }

  for (
    let index = 0;
    index < compatibilityRows.length;
    index += BATCH_WRITE_SIZE
  ) {
    const chunk = compatibilityRows.slice(index, index + BATCH_WRITE_SIZE);
    const { error } = await supabase
      .from("skill_agent_compatibility")
      .upsert(chunk, { onConflict: "skill_id,agent_id" });

    if (error) {
      throw new Error(
        `Failed to upsert skill/agent compatibility: ${error.message}`,
      );
    }
  }
}

async function syncStarterCategories(
  supabase: SupabaseClient,
  records: ParsedRecord[],
  skillIds: Map<string, number>,
) {
  const { error: categoriesError } = await supabase
    .from("categories")
    .upsert(
      skillCategoryDefinitions.map((category, index) => ({
        name: category.name,
        slug: category.slug,
        description: category.description,
        display_order: index,
      })),
      { onConflict: "slug" },
    );

  if (categoriesError) {
    throw new Error(
      `Failed to upsert starter categories: ${categoriesError.message}`,
    );
  }

  const { data: categoryRows, error: categoryLookupError } = await supabase
    .from("categories")
    .select("id, slug");

  if (categoryLookupError) {
    throw new Error(
      `Failed to load category IDs: ${categoryLookupError.message}`,
    );
  }

  const categoryIds = new Map(
    (categoryRows ?? []).map((row) => [row.slug as string, row.id as number]),
  );
  const currentSkillIds = [...skillIds.values()];

  for (let index = 0; index < currentSkillIds.length; index += BATCH_WRITE_SIZE) {
    const chunk = currentSkillIds.slice(index, index + BATCH_WRITE_SIZE);
    const { error } = await supabase
      .from("skill_categories")
      .delete()
      .in("skill_id", chunk);

    if (error) {
      throw new Error(
        `Failed to clear skill/category links: ${error.message}`,
      );
    }
  }

  const linkRows = records.flatMap((record) => {
    const skillId = skillIds.get(record.skill.canonicalSourceUrl);

    if (!skillId) {
      return [];
    }

    const categorySlugs = classifySkillCategories({
      name: record.skill.name,
      shortSummary: record.skill.shortSummary,
      longDescription: record.skill.longDescription,
      installCommand: record.skill.installCommand,
      sourceSlug: record.skill.sourceSlug,
      repositoryUrl:
        record.repositoryMeta?.repositoryUrl ?? record.skill.repositoryUrl,
      repositoryTopics: record.repositoryMeta?.repoTopics ?? [],
      agentNames: record.skill.installedAgents.map((agent) => agent.name),
    });

    return categorySlugs.flatMap((categorySlug) => {
      const categoryId = categoryIds.get(categorySlug);

      if (!categoryId) {
        return [];
      }

      return [
        {
          skill_id: skillId,
          category_id: categoryId,
        },
      ];
    });
  });

  for (let index = 0; index < linkRows.length; index += BATCH_WRITE_SIZE) {
    const chunk = linkRows.slice(index, index + BATCH_WRITE_SIZE);
    const { error } = await supabase
      .from("skill_categories")
      .upsert(chunk, { onConflict: "skill_id,category_id" });

    if (error) {
      throw new Error(
        `Failed to upsert skill/category links: ${error.message}`,
      );
    }
  }
}

async function collectSkillRecords(
  urls: string[],
  limit?: number,
): Promise<{ records: ParsedRecord[]; errors: string[] }> {
  const selectedUrls = typeof limit === "number" ? urls.slice(0, limit) : urls;
  const records: Array<ParsedRecord | null> = new Array(selectedUrls.length).fill(
    null,
  );
  const errors: string[] = [];
  let currentIndex = 0;

  async function worker() {
    while (true) {
      const index = currentIndex;
      currentIndex += 1;

      if (index >= selectedUrls.length) {
        return;
      }

      const url = selectedUrls[index];

      try {
        const html = await fetchSkillPageHtml(url);
        const skill = parseSkillsShSkillPage(url, html);
        const repositoryMeta = skill.repositoryUrl
          ? await getGitHubRepositoryMeta(skill.repositoryUrl)
          : null;

        records[index] = {
          skill,
          rawHtml: html,
          repositoryMeta,
        };
      } catch (error) {
        errors.push(
          `${url}: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.min(PAGE_FETCH_CONCURRENCY, selectedUrls.length) },
      () => worker(),
    ),
  );

  return {
    records: records.filter(
      (value): value is ParsedRecord => value !== null,
    ),
    errors,
  };
}

function chunkItems<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function buildSnapshotFiles(
  prefix: string,
  rawSitemap: string,
  records: ParsedRecord[],
  errors: string[],
): SnapshotFile[] {
  const snapshotFiles: SnapshotFile[] = [
    {
      path: `${prefix}/sitemap.xml`,
      body: rawSitemap,
      contentType: "application/xml",
    },
  ];

  const pageChunks = chunkItems(records, SNAPSHOT_PAGE_CHUNK_SIZE);
  const parsedChunks = chunkItems(records, SNAPSHOT_PARSED_CHUNK_SIZE);

  pageChunks.forEach((chunk, index) => {
    snapshotFiles.push({
      path: `${prefix}/pages-${String(index + 1).padStart(4, "0")}.ndjson`,
      body: chunk
        .map((record) =>
          JSON.stringify({
            url: record.skill.canonicalSourceUrl,
            html: record.rawHtml,
          }),
        )
        .join("\n"),
      contentType: "application/x-ndjson",
    });
  });

  parsedChunks.forEach((chunk, index) => {
    snapshotFiles.push({
      path: `${prefix}/parsed-${String(index + 1).padStart(4, "0")}.json`,
      body: JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          records: chunk.map((record) => ({
            skill: record.skill,
            repositoryMeta: record.repositoryMeta,
          })),
        },
        null,
        2,
      ),
      contentType: "application/json",
    });
  });

  if (errors.length > 0) {
    snapshotFiles.push({
      path: `${prefix}/errors.json`,
      body: JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          errors,
        },
        null,
        2,
      ),
      contentType: "application/json",
    });
  }

  return snapshotFiles;
}

export async function runSkillsShSync(
  options: SyncOptions,
): Promise<SyncSummary> {
  const supabase = createServiceRoleSupabaseClient();
  const syncRunId = await startSyncRun(supabase, options.trigger);
  const syncedAt = new Date().toISOString();

  try {
    const sitemap = await fetchSkillsShSitemap();
    const { records, errors } = await collectSkillRecords(
      sitemap.urls,
      options.limit,
    );
    const snapshotPrefix = buildRunPrefix();
    const rawSnapshotPath = await uploadSnapshotFiles(
      supabase,
      buildSnapshotFiles(snapshotPrefix, sitemap.rawXml, records, errors),
    );
    const sourceIds = await upsertSources(supabase, records, syncedAt);
    const repositoryIds = await upsertRepositories(
      supabase,
      records,
      sourceIds,
      syncedAt,
    );
    const skillIds = await upsertSkills(
      supabase,
      records,
      sourceIds,
      repositoryIds,
      syncedAt,
    );

    await upsertAgentsAndCompatibility(supabase, records, skillIds, syncedAt);
    await syncStarterCategories(supabase, records, skillIds);

    const summary: SyncSummary = {
      status: "completed",
      trigger: options.trigger,
      itemsFound: records.length,
      itemsCreated: records.length,
      itemsUpdated: 0,
      errorsCount: errors.length,
      rawSnapshotPath,
    };

    await finishSyncRun(supabase, syncRunId, {
      ...summary,
      notes:
        errors.length > 0
          ? `Completed with ${errors.length} page-level parser errors.`
          : "Completed successfully.",
    });

    return summary;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    await finishSyncRun(supabase, syncRunId, {
      status: "failed",
      itemsFound: 0,
      itemsCreated: 0,
      itemsUpdated: 0,
      errorsCount: 1,
      rawSnapshotPath: null,
      notes: message,
    });

    throw error;
  }
}

import "server-only";

import type { SkillListItem } from "@/lib/db/skills";
import { searchSkills } from "@/lib/db/search";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type BrowseAgent = {
  description: string | null;
  highestRatedSkill: SkillListItem | null;
  id: number;
  lastUpdatedAt: string | null;
  name: string;
  reviewedSkillCount: number;
  skillCount: number;
  slug: string;
  topPicks: SkillListItem[];
};

export async function getAllAgents(): Promise<BrowseAgent[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("agents")
    .select("id, name, slug, short_description")
    .eq("status", "active")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  const rows = data ?? [];
  const agents = await Promise.all(
    rows.map(async (row) => {
      const { count, error: countError } = await supabase
        .from("skill_agent_compatibility")
        .select("*", { count: "exact", head: true })
        .eq("agent_id", row.id);

      if (countError) {
        throw countError;
      }

      return {
        id: row.id as number,
        name: row.name as string,
        slug: row.slug as string,
        description: (row.short_description as string | null) ?? null,
        skillCount: count ?? 0,
        reviewedSkillCount: 0,
        lastUpdatedAt: null,
        topPicks: [],
        highestRatedSkill: null,
      } satisfies BrowseAgent;
    }),
  );

  return agents;
}

async function getLatestAgentSignal(agentId: number) {
  const supabase = createServerSupabaseClient();
  const [{ data: latestSyncData, error: latestSyncError }, { data: latestUpdateData, error: latestUpdateError }] =
    await Promise.all([
      supabase
        .from("skills")
        .select("last_synced_at, skill_agent_compatibility!inner(agent_id)")
        .eq("status", "active")
        .eq("skill_agent_compatibility.agent_id", agentId)
        .order("last_synced_at", { ascending: false, nullsFirst: false })
        .limit(1),
      supabase
        .from("skills")
        .select("updated_at, skill_agent_compatibility!inner(agent_id)")
        .eq("status", "active")
        .eq("skill_agent_compatibility.agent_id", agentId)
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

export async function getAgentBySlug(agentSlug: string): Promise<BrowseAgent | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("agents")
    .select("id, name, slug, short_description")
    .eq("slug", agentSlug)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const agentId = data.id as number;
  const [
    skillCountResult,
    reviewedSkillCountResult,
    topPicksResult,
    lastUpdatedAt,
  ] = await Promise.all([
    supabase
      .from("skill_agent_compatibility")
      .select("*", { count: "exact", head: true })
      .eq("agent_id", agentId),
    supabase
      .from("skills")
      .select("id, skill_agent_compatibility!inner(agent_id)", {
        count: "exact",
        head: true,
      })
      .eq("status", "active")
      .eq("skill_agent_compatibility.agent_id", agentId)
      .gt("approved_review_count", 0),
    searchSkills({
      agentId,
      page: 1,
      pageSize: 3,
      sort: "top-rated",
    }),
    getLatestAgentSignal(agentId),
  ]);

  if (skillCountResult.error) {
    throw skillCountResult.error;
  }

  if (reviewedSkillCountResult.error) {
    throw reviewedSkillCountResult.error;
  }

  return {
    id: agentId,
    name: data.name as string,
    slug: data.slug as string,
    description: (data.short_description as string | null) ?? null,
    skillCount: skillCountResult.count ?? 0,
    reviewedSkillCount: reviewedSkillCountResult.count ?? 0,
    lastUpdatedAt,
    topPicks: topPicksResult.items,
    highestRatedSkill: topPicksResult.items[0] ?? null,
  };
}

export async function getAllAgentSlugs(): Promise<string[]> {
  const agents = await getAllAgents();
  return agents.map((agent) => agent.slug);
}

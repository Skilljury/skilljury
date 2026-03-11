import "server-only";

import { getGitHubRepositoryMeta } from "@/lib/ingestion/githubRepoMeta";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

type SubmissionPrefillAgent = {
  id: number;
  name: string;
  slug: string;
};

export type SubmissionPrefillResult = {
  inferredAgents: SubmissionPrefillAgent[];
  inferredName: string | null;
  inferredSourceUrl: string | null;
  inferredSummary: string | null;
  repositoryUrl: string | null;
};

function sanitizeOptionalUrl(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  try {
    return new URL(trimmed).toString();
  } catch {
    return null;
  }
}

function parseGitHubRepository(value: string | null | undefined) {
  const normalizedUrl = sanitizeOptionalUrl(value);

  if (!normalizedUrl) {
    return null;
  }

  const parsed = new URL(normalizedUrl);
  const segments = parsed.pathname.split("/").filter(Boolean);

  if (parsed.hostname !== "github.com" || segments.length < 2) {
    return null;
  }

  return `https://github.com/${segments[0]}/${segments[1]}`;
}

function inferAgentMatches(
  agents: Array<{
    id: number;
    name: string;
    slug: string;
    vendor_name: string | null;
  }>,
  corpus: string,
) {
  const lowered = corpus.toLowerCase();

  return agents.filter((agent) => {
    const signals = [
      agent.slug,
      agent.name,
      agent.vendor_name ?? "",
    ].filter(Boolean);

    return signals.some((signal) => lowered.includes(signal.toLowerCase()));
  });
}

export async function prefillFromUrl({
  repositoryUrl,
  sourceUrl,
}: {
  repositoryUrl?: string | null;
  sourceUrl?: string | null;
}): Promise<SubmissionPrefillResult> {
  const normalizedRepositoryUrl = parseGitHubRepository(repositoryUrl);
  const normalizedSourceUrl = sanitizeOptionalUrl(sourceUrl);
  const repositoryMeta = normalizedRepositoryUrl
    ? await getGitHubRepositoryMeta(normalizedRepositoryUrl)
    : null;
  const supabase = createServiceRoleSupabaseClient();
  const { data: agents, error } = await supabase
    .from("agents")
    .select("id, name, slug, vendor_name")
    .eq("status", "active");

  if (error) {
    throw error;
  }

  const corpus = [
    normalizedRepositoryUrl,
    normalizedSourceUrl,
    repositoryMeta?.ownerName,
    repositoryMeta?.repositoryName,
    repositoryMeta?.readmeExcerpt,
    repositoryMeta?.homepageUrl,
    ...(repositoryMeta?.repoTopics ?? []),
  ]
    .filter(Boolean)
    .join(" ");
  const inferredAgents = inferAgentMatches(
    (agents ?? []) as Array<{
      id: number;
      name: string;
      slug: string;
      vendor_name: string | null;
    }>,
    corpus,
  ).map((agent) => ({
    id: agent.id,
    name: agent.name,
    slug: agent.slug,
  }));

  return {
    inferredAgents,
    inferredName: repositoryMeta?.repositoryName ?? null,
    inferredSourceUrl:
      normalizedSourceUrl ?? repositoryMeta?.homepageUrl ?? normalizedRepositoryUrl,
    inferredSummary: repositoryMeta?.readmeExcerpt ?? null,
    repositoryUrl: normalizedRepositoryUrl,
  };
}

export type GitHubRepositoryMeta = {
  ownerName: string;
  repositoryName: string;
  repositoryUrl: string;
  defaultBranch: string | null;
  license: string | null;
  stars: number;
  forks: number;
  openIssuesCount: number;
  lastPushedAt: string | null;
  readmeExcerpt: string | null;
  repoTopics: string[];
  homepageUrl: string | null;
};

const repositoryMetaCache = new Map<string, Promise<GitHubRepositoryMeta | null>>();
let githubRateLimited = false;

function sanitizeEnvValue(value: string | undefined) {
  if (!value) {
    return null;
  }

  return value.replace(/^<|>$/g, "").trim() || null;
}

function parseGitHubRepository(url: string) {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split("/").filter(Boolean);

    if (parsed.hostname !== "github.com" || segments.length < 2) {
      return null;
    }

    return {
      ownerName: segments[0],
      repositoryName: segments[1],
      repositoryUrl: `https://github.com/${segments[0]}/${segments[1]}`,
    };
  } catch {
    return null;
  }
}

export async function getGitHubRepositoryMeta(repositoryUrl: string) {
  const parsed = parseGitHubRepository(repositoryUrl);

  if (!parsed) {
    return null;
  }

  if (githubRateLimited) {
    return null;
  }

  const cached = repositoryMetaCache.get(parsed.repositoryUrl);

  if (cached) {
    return cached;
  }

  const request = fetchGitHubRepositoryMeta(parsed.repositoryUrl, parsed);
  repositoryMetaCache.set(parsed.repositoryUrl, request);

  return request;
}

async function fetchGitHubRepositoryMeta(
  repositoryUrl: string,
  parsed: {
    ownerName: string;
    repositoryName: string;
    repositoryUrl: string;
  },
) {
  const githubToken = sanitizeEnvValue(process.env.GITHUB_TOKEN);
  const headers: Record<string, string> = {
    accept: "application/vnd.github+json",
    "user-agent": "SkillJuryBot/0.1",
  };

  if (githubToken) {
    headers.authorization = `Bearer ${githubToken}`;
  }

  const response = await fetch(
    `https://api.github.com/repos/${parsed.ownerName}/${parsed.repositoryName}`,
    {
      headers,
      signal: AbortSignal.timeout(12_000),
      next: {
        revalidate: 0,
      },
    },
  );

  if (response.status === 404) {
    return null;
  }

  if (response.status === 403 || response.status === 429) {
    githubRateLimited = true;

    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[SkillJury:github-meta] Rate limited while fetching ${repositoryUrl}; continuing without GitHub enrichment.`,
      );
    }

    return null;
  }

  if (!response.ok) {
    throw new Error(
      `GitHub metadata fetch failed for ${parsed.repositoryUrl}: ${response.status}`,
    );
  }

  const data = (await response.json()) as {
    default_branch?: string;
    license?: { spdx_id?: string | null; name?: string | null } | null;
    stargazers_count?: number;
    forks_count?: number;
    open_issues_count?: number;
    pushed_at?: string | null;
    description?: string | null;
    topics?: string[];
    homepage?: string | null;
  };

  return {
    ownerName: parsed.ownerName,
    repositoryName: parsed.repositoryName,
    repositoryUrl: parsed.repositoryUrl,
    defaultBranch: data.default_branch ?? null,
    license: data.license?.spdx_id || data.license?.name || null,
    stars: data.stargazers_count ?? 0,
    forks: data.forks_count ?? 0,
    openIssuesCount: data.open_issues_count ?? 0,
    lastPushedAt: data.pushed_at ?? null,
    readmeExcerpt: data.description ?? null,
    repoTopics: data.topics ?? [],
    homepageUrl: data.homepage ?? null,
  } satisfies GitHubRepositoryMeta;
}

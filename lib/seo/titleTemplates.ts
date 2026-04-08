const siteName = "SkillJury";
const brandSuffix = ` | ${siteName}`;
const maxTitleLength = 60;
const minSubjectLength = 12;
const preservedTokens = new Map([
  ["ai", "AI"],
  ["api", "API"],
  ["aws", "AWS"],
  ["cli", "CLI"],
  ["css", "CSS"],
  ["csv", "CSV"],
  ["db", "DB"],
  ["gpt", "GPT"],
  ["html", "HTML"],
  ["http", "HTTP"],
  ["https", "HTTPS"],
  ["id", "ID"],
  ["ids", "IDs"],
  ["ios", "iOS"],
  ["json", "JSON"],
  ["jwt", "JWT"],
  ["llm", "LLM"],
  ["mcp", "MCP"],
  ["ocr", "OCR"],
  ["oauth", "OAuth"],
  ["pdf", "PDF"],
  ["qa", "QA"],
  ["sdk", "SDK"],
  ["seo", "SEO"],
  ["sql", "SQL"],
  ["ts", "TS"],
  ["tsx", "TSX"],
  ["ui", "UI"],
  ["uri", "URI"],
  ["url", "URL"],
  ["ux", "UX"],
  ["xml", "XML"],
]);

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function titleCaseFragment(value: string) {
  if (!value) {
    return value;
  }

  const preferredToken = preservedTokens.get(value.toLowerCase());

  if (preferredToken) {
    return preferredToken;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function normalizeTitleEntity(value: string) {
  const trimmed = normalizeWhitespace(value);

  if (!trimmed) {
    return siteName;
  }

  if (!/^[a-z0-9/_-]+$/i.test(trimmed)) {
    return trimmed;
  }

  return trimmed
    .split("/")
    .filter(Boolean)
    .map((segment) =>
      segment
        .split(/[-_]+/)
        .filter(Boolean)
        .map((part) => titleCaseFragment(part.toLowerCase()))
        .join(" "),
    )
    .join(" / ");
}

function truncateTitleSegment(value: string, maxLength: number) {
  const normalized = normalizeWhitespace(value);

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const trimmed = normalized.slice(0, Math.max(maxLength - 3, 1));
  const boundary = trimmed.lastIndexOf(" ");
  const candidate =
    boundary >= Math.floor(maxLength * 0.6) ? trimmed.slice(0, boundary) : trimmed;

  return `${candidate.trimEnd()}...`;
}

function withBrand(coreTitle: string) {
  const normalized = normalizeWhitespace(coreTitle);
  const maxCoreLength = maxTitleLength - brandSuffix.length;

  return `${truncateTitleSegment(normalized, maxCoreLength)}${brandSuffix}`;
}

export function buildSeoTitle(subject: string, qualifier?: string) {
  const normalizedSubject = normalizeTitleEntity(subject);
  const normalizedQualifier = qualifier ? normalizeWhitespace(qualifier) : "";
  const qualifierSuffix = normalizedQualifier ? ` ${normalizedQualifier}` : "";
  const subjectBudget = Math.max(
    maxTitleLength - brandSuffix.length - qualifierSuffix.length,
    minSubjectLength,
  );

  return `${truncateTitleSegment(normalizedSubject, subjectBudget)}${qualifierSuffix}${brandSuffix}`;
}

export function normalizeMetadataTitle(title: string) {
  const normalized = normalizeWhitespace(title).replace(/[\u2013\u2014]/g, "-");

  if (!normalized) {
    return siteName;
  }

  if (normalized.endsWith(brandSuffix)) {
    return withBrand(normalized.slice(0, -brandSuffix.length));
  }

  return truncateTitleSegment(normalized, maxTitleLength);
}

export function buildSkillMetadataTitle(skillName: string) {
  return buildSeoTitle(skillName, "reviews");
}

export function buildSkillReviewTitle(skillName: string) {
  return buildSeoTitle(skillName, "write review");
}

export function buildSkillReviewArchiveTitle(skillName: string) {
  return buildSeoTitle(skillName, "user reviews");
}

export function buildSearchMetadataText(query?: string | null) {
  if (query && query.trim().length > 0) {
    return {
      title: buildSeoTitle(query, "skills search"),
      description: `Search SkillJury for ${query.trim()} AI agent skills. Filter by source, agent, and category. Compare install counts, community reviews, and security audits.`,
    };
  }

  return {
    title: withBrand("Search AI skills"),
    description:
      "Search the SkillJury catalog of AI agent skills for Claude Code, Cursor, Windsurf, Codex, and Cline. Filter by source, agent, category, and sort by popularity or rating.",
  };
}

export function buildCategoryMetadataText(categoryName: string) {
  return {
    title: buildSeoTitle(categoryName, "AI skills"),
    description: `Browse the best ${categoryName} AI agent skills on SkillJury. Compare community ratings, weekly install counts, security audit signals, and compatibility across Claude Code, Cursor, Windsurf, and more.`,
  };
}

export function buildAgentMetadataText(agentName: string) {
  return {
    title: buildSeoTitle(agentName, "skills"),
    description: `Explore top-rated AI agent skills compatible with ${agentName}. Community reviews, install counts, security audits, and source metadata on SkillJury.`,
  };
}

export function buildSourceMetadataText(sourceName: string) {
  return {
    title: buildSeoTitle(sourceName, "source skills"),
    description: `Browse AI agent skills imported from ${sourceName} on SkillJury. Compare popularity, community reviews, security audits, and agent compatibility.`,
  };
}

export function buildListingMetadataText(kind: "top-rated" | "new" | "trending") {
  switch (kind) {
    case "top-rated":
      return {
        title: withBrand("Top AI skills"),
        description:
          "The most-installed AI agent skills for Claude Code, Cursor, Windsurf, Codex, and Cline. Ranked by weekly install volume with community reviews and security audit signals on SkillJury.",
      };
    case "new":
      return {
        title: withBrand("New AI skills"),
        description:
          "Track the newest AI agent skills added to the SkillJury catalog. Ordered by first-seen date with install counts, community reviews, and agent compatibility data.",
      };
    case "trending":
      return {
        title: withBrand("Trending AI skills"),
        description:
          "Discover trending AI agent skills on SkillJury. Ranked by weekly install momentum for Claude Code, Cursor, Windsurf, Codex, and Cline with community reviews and security signals.",
      };
  }
}

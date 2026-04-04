const siteName = "SkillJury";

export function buildSearchMetadataText(query?: string | null) {
  if (query && query.trim().length > 0) {
    return {
      title: `${query.trim()} Skills - Search Results & Reviews | ${siteName}`,
      description: `Search SkillJury for ${query.trim()} AI agent skills. Filter by source, agent, and category. Compare install counts, community reviews, and security audits.`,
    };
  }

  return {
    title: `Search AI Agent Skills — Reviews, Installs & Compatibility | ${siteName}`,
    description:
      "Search the SkillJury catalog of AI agent skills for Claude Code, Cursor, Windsurf, Codex, and Cline. Filter by source, agent, category, and sort by popularity or rating.",
  };
}

export function buildCategoryMetadataText(categoryName: string) {
  return {
    title: `Best ${categoryName} AI Agent Skills — Reviewed & Rated | ${siteName}`,
    description: `Browse the best ${categoryName} AI agent skills on SkillJury. Compare community ratings, weekly install counts, security audit signals, and compatibility across Claude Code, Cursor, Windsurf, and more.`,
  };
}

export function buildAgentMetadataText(agentName: string) {
  return {
    title: `Best ${agentName} Skills — Reviews, Ratings & Compatibility | ${siteName}`,
    description: `Explore top-rated AI agent skills compatible with ${agentName}. Community reviews, install counts, security audits, and source metadata on SkillJury.`,
  };
}

export function buildSourceMetadataText(sourceName: string) {
  return {
    title: `${sourceName} Skills — Reviews, Ratings & Install Guide | ${siteName}`,
    description: `Browse AI agent skills imported from ${sourceName} on SkillJury. Compare popularity, community reviews, security audits, and agent compatibility.`,
  };
}

export function buildListingMetadataText(
  kind: "top-rated" | "new" | "trending",
) {
  switch (kind) {
    case "top-rated":
      return {
        title: `Most Popular AI Agent Skills — Install Rankings | ${siteName}`,
        description:
          "The most-installed AI agent skills for Claude Code, Cursor, Windsurf, Codex, and Cline. Ranked by weekly install volume with community reviews and security audit signals on SkillJury.",
      };
    case "new":
      return {
        title: `New AI Agent Skills — Latest Catalog Additions | ${siteName}`,
        description:
          "Track the newest AI agent skills added to the SkillJury catalog. Ordered by first-seen date with install counts, community reviews, and agent compatibility data.",
      };
    case "trending":
      return {
        title: `Trending AI Agent Skills — Popular Right Now | ${siteName}`,
        description:
          "Discover trending AI agent skills on SkillJury. Ranked by weekly install momentum for Claude Code, Cursor, Windsurf, Codex, and Cline with community reviews and security signals.",
      };
  }
}

const siteName = "SkillJury";

export function buildSearchMetadataText(query?: string | null) {
  if (query && query.trim().length > 0) {
    return {
      title: `${query.trim()} Skills - Search Results & Reviews | ${siteName}`,
      description: `Search SkillJury for ${query.trim()} skills, then filter by source, agent, and category to find the best fit.`,
    };
  }

  return {
    title: `Search AI Agent Skills | ${siteName}`,
    description:
      "Search the SkillJury catalog by skill name, description, source, agent, and category.",
  };
}

export function buildCategoryMetadataText(categoryName: string) {
  return {
    title: `Best ${categoryName} Skills - Reviews, Ratings & Top Picks | ${siteName}`,
    description: `Browse ${categoryName} skills in SkillJury, including catalog rankings, source context, and related tools.`,
  };
}

export function buildAgentMetadataText(agentName: string) {
  return {
    title: `Best ${agentName} Skills - Reviews, Ratings & Compatibility | ${siteName}`,
    description: `Explore skills that work with ${agentName}, including popularity signals, source context, and linked catalog entries.`,
  };
}

export function buildSourceMetadataText(sourceName: string) {
  return {
    title: `${sourceName} Skills - Reviews, Ratings & Directory | ${siteName}`,
    description: `See skills imported from ${sourceName}, including popularity signals, related agents, and category context.`,
  };
}

export function buildListingMetadataText(
  kind: "top-rated" | "new" | "trending",
) {
  switch (kind) {
    case "top-rated":
      return {
        title: `Top Rated Skills - Reviews, Ratings & Catalog Leaders | ${siteName}`,
        description:
          "Browse the top-rated side of the SkillJury catalog using public reviews, confidence-adjusted ratings, and current catalog signals.",
      };
    case "new":
      return {
        title: `New Skills - Latest Catalog Additions | ${siteName}`,
        description:
          "Track the newest skills in the SkillJury catalog, ordered by first-seen date and live catalog activity.",
      };
    case "trending":
      return {
        title: `Trending Skills - Popular AI Agent Skills Right Now | ${siteName}`,
        description:
          "Browse trending skills in SkillJury using current weekly install activity and recent catalog freshness.",
      };
  }
}

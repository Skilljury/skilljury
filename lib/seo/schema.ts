import { buildCanonicalUrl } from "@/lib/seo/metadata";

type FaqEntry = {
  answer: string;
  question: string;
};

export function serializeJsonLd(data: Record<string, unknown>) {
  return JSON.stringify(data, null, 0);
}

export function buildOrganizationJsonLd({
  liveSkillCount,
  liveSourceCount,
  agentCount,
}: {
  liveSkillCount: number;
  liveSourceCount: number;
  agentCount?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    alternateName: ["Skill Jury", "skilljury.com"],
    description: `SkillJury indexes ${liveSkillCount.toLocaleString("en-US")} AI agent skills from ${liveSourceCount.toLocaleString("en-US")} sources${agentCount ? ` across ${agentCount} AI agents including Claude Code, Cursor, Windsurf, Codex, and Cline` : ""}. Each listing includes security audit signals, public reviews, install context, and source metadata.`,
    knowsAbout: [
      "AI agent skills",
      "software reviews",
      "tool discovery",
      "Claude Code",
      "Cursor",
      "Windsurf",
      "Codex",
      "Cline",
      "MCP tools",
    ],
    logo: buildCanonicalUrl("/icon.svg"),
    name: "SkillJury",
    slogan: `Browse ${liveSkillCount.toLocaleString("en-US")} imported skills across ${liveSourceCount.toLocaleString("en-US")} active sources with public review and trust signals.`,
    url: buildCanonicalUrl("/"),
  };
}

export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    alternateName: ["Skill Jury", "skilljury.com"],
    description:
      "A live directory of AI agent skills with reviews, install context, source repositories, and compatibility pages for Claude Code, Cursor, Windsurf, Codex, and Cline.",
    name: "SkillJury",
    potentialAction: {
      "@type": "SearchAction",
      "query-input": "required name=search_term_string",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${buildCanonicalUrl("/search")}?q={search_term_string}`,
      },
    },
    publisher: {
      "@type": "Organization",
      name: "SkillJury",
      url: buildCanonicalUrl("/"),
    },
    url: buildCanonicalUrl("/"),
  };
}

export function buildItemListJsonLd({
  canonicalPath,
  itemName,
  items,
}: {
  canonicalPath: string;
  itemName: string;
  items: Array<{ name: string; url: string }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      name: item.name,
      position: index + 1,
      url: item.url,
    })),
    name: itemName,
    url: buildCanonicalUrl(canonicalPath),
  };
}

export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      item: buildCanonicalUrl(item.path),
      name: item.name,
      position: index + 1,
    })),
  };
}

export function buildFaqJsonLd(faqEntries: FaqEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqEntries.map((entry) => ({
      "@type": "Question",
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.answer,
      },
      name: entry.question,
    })),
  };
}

export function buildAggregateRatingJsonLd({
  canonicalPath,
  description,
  name,
  ratingValue,
  reviewCount,
}: {
  canonicalPath: string;
  description: string;
  name: string;
  ratingValue: number;
  reviewCount: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    aggregateRating: {
      "@type": "AggregateRating",
      bestRating: "5",
      ratingCount: String(reviewCount),
      ratingValue: ratingValue.toFixed(2),
      worstRating: "1",
    },
    applicationCategory: "DeveloperApplication",
    description,
    name,
    url: buildCanonicalUrl(canonicalPath),
  };
}

export function buildSoftwareApplicationJsonLd({
  canonicalPath,
  dateModified,
  datePublished,
  description,
  name,
  ratingValue,
  reviewCount,
  reviews,
}: {
  canonicalPath: string;
  dateModified?: string | null;
  datePublished?: string | null;
  description: string;
  name: string;
  ratingValue?: number | null;
  reviewCount?: number;
  reviews?: Array<{
    author: string;
    datePublished: string;
    ratingValue: number;
    reviewBody: string;
  }>;
}) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    applicationCategory: "DeveloperApplication",
    description,
    name,
    operatingSystem: "Cross-platform",
    url: buildCanonicalUrl(canonicalPath),
  };

  if (datePublished) {
    schema.datePublished = datePublished;
  }
  if (dateModified) {
    schema.dateModified = dateModified;
  }

  if (ratingValue && reviewCount && reviewCount > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      bestRating: "5",
      ratingCount: String(reviewCount),
      ratingValue: ratingValue.toFixed(2),
      worstRating: "1",
    };
  }

  if (reviews && reviews.length > 0) {
    schema.review = reviews.map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.author },
      datePublished: r.datePublished,
      reviewBody: r.reviewBody,
      reviewRating: {
        "@type": "Rating",
        bestRating: "5",
        ratingValue: String(r.ratingValue),
        worstRating: "1",
      },
    }));
  }

  return schema;
}

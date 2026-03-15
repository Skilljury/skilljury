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
}: {
  liveSkillCount: number;
  liveSourceCount: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    alternateName: ["Skill Jury", "skilljury.com"],
    description:
      "SkillJury is a live directory of AI agent skills with public reviews, source metadata, and install context.",
    knowsAbout: ["AI agent skills", "software reviews", "tool discovery"],
    logo: buildCanonicalUrl("/icon.svg"),
    name: "SkillJury",
    slogan: `Browse ${liveSkillCount} imported skills across ${liveSourceCount} active sources with public review and trust signals.`,
    url: buildCanonicalUrl("/"),
  };
}

export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    alternateName: ["Skill Jury", "skilljury.com"],
    description:
      "A live directory of AI agent skills with reviews, install context, source repositories, and compatibility pages.",
    name: "SkillJury",
    potentialAction: {
      "@type": "SearchAction",
      "query-input": "required name=search_term_string",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${buildCanonicalUrl("/search")}?q={search_term_string}`,
      },
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

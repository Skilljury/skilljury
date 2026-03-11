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
    description:
      "SkillJury is the public review and discovery layer for AI agent skills.",
    knowsAbout: ["AI agent skills", "software reviews", "tool discovery"],
    name: "SkillJury",
    slogan: `Browse ${liveSkillCount} imported skills across ${liveSourceCount} active sources.`,
    url: buildCanonicalUrl("/"),
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

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/JsonLd";
import { RatingDistribution } from "@/components/reviews/RatingDistribution";
import { RecommendationSummary } from "@/components/reviews/RecommendationSummary";
import { ReviewList } from "@/components/reviews/ReviewList";
import { QuickFacts } from "@/components/skills/QuickFacts";
import { RelatedSkills } from "@/components/skills/RelatedSkills";
import { SkillFaqSection } from "@/components/skills/SkillFaqSection";
import { SkillHero } from "@/components/skills/SkillHero";
import { SkillMetaPanel } from "@/components/skills/SkillMetaPanel";
import { TaxonomyLinks } from "@/components/skills/TaxonomyLinks";
import { getCurrentViewer } from "@/lib/auth/session";
import {
  getRelatedSkillsByCategory,
  getRelatedSkillsBySource,
  getSkillBySlug,
} from "@/lib/db/skills";
import { getSkillReviews } from "@/lib/reviews/getSkillReviews";
import { getReviewRequestSummary } from "@/lib/skills/reviewRequests";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  buildAggregateRatingJsonLd,
  buildFaqJsonLd,
} from "@/lib/seo/schema";
import { getTurnstileSiteKey } from "@/lib/supabase/config";

type SkillPageProps = {
  params: Promise<{
    skillSlug: string;
  }>;
};

function maxDate(firstValue: string | null, secondValue: string | null) {
  const candidates = [firstValue, secondValue].filter(
    (value): value is string => Boolean(value),
  );

  if (candidates.length === 0) {
    return null;
  }

  return candidates.sort().at(-1) ?? null;
}

export async function generateMetadata({
  params,
}: SkillPageProps): Promise<Metadata> {
  const { skillSlug } = await params;
  const skill = await getSkillBySlug(skillSlug);

  if (!skill) {
    return buildPageMetadata({
      title: "Skill not found | SkillJury",
      description: "The requested skill could not be found in the SkillJury catalog.",
      pathname: `/skills/${skillSlug}`,
    });
  }

  return buildPageMetadata({
    title: `${skill.name} Review - Ratings, Alternatives & User Reviews | SkillJury`,
    description:
      skill.shortSummary ??
      `Inspect ${skill.name} on SkillJury, including user ratings, install context, and source metadata.`,
    pathname: `/skills/${skill.slug}`,
  });
}

export default async function SkillPage({ params }: SkillPageProps) {
  const { skillSlug } = await params;
  const viewer = await getCurrentViewer();
  const skill = await getSkillBySlug(skillSlug);

  if (!skill) {
    notFound();
  }

  const [reviewBundle, relatedBySource, relatedByCategory, reviewRequestSummary] =
    await Promise.all([
    getSkillReviews({
      skillId: skill.id,
      viewerUserId: viewer.user?.id ?? null,
    }),
    skill.sourceId
      ? getRelatedSkillsBySource(skill.sourceId, skill.slug, 4)
      : Promise.resolve([]),
    skill.categories[0]
      ? getRelatedSkillsByCategory(skill.categories[0].id, skill.slug, 4)
      : Promise.resolve([]),
    getReviewRequestSummary(skill.id, viewer.user?.id ?? null),
    ]);
  const alternatives = relatedByCategory.slice(0, 4).map((alternative) => ({
    name: alternative.name,
    slug: alternative.slug,
  }));
  const agentLabel =
    skill.agentInstallData.length > 0
      ? skill.agentInstallData.map((agent) => agent.agentName).join(", ")
      : "Agent compatibility has not been published yet.";
  const categoryLabel =
    skill.categories.length > 0
      ? skill.categories.map((category) => category.name).join(", ")
      : "Uncategorized";
  const sourceLabel = skill.source?.name ?? "skills.sh import";
  const lastUpdatedAt = maxDate(
    skill.lastSyncedAt,
    reviewBundle.summary.lastApprovedReviewAt,
  );
  const faqEntries = [
    {
      question: `What does ${skill.name} do?`,
      answer:
        skill.shortSummary ??
        `${skill.name} is listed in SkillJury, but the source summary is still sparse.`,
    },
    {
      question: `Is ${skill.name} good?`,
      answer:
        reviewBundle.summary.approvedCount > 0 && reviewBundle.summary.overallAverage
          ? `${skill.name} currently holds a ${reviewBundle.summary.overallAverage.toFixed(2)}/5 average from ${reviewBundle.summary.approvedCount} approved reviews, and ${reviewBundle.summary.recommendationPercentage ?? 0}% of reviewers would recommend it.`
          : `${skill.name} does not have approved reviews yet, so SkillJury cannot publish a community verdict.`,
    },
    {
      question: `What agent does ${skill.name} work with?`,
      answer: `${skill.name} currently lists compatibility with ${agentLabel}.`,
    },
    {
      question: `What are alternatives to ${skill.name}?`,
      answer:
        alternatives.length > 0
          ? `Skills in the same category include ${alternatives.map((item) => item.name).join(", ")}.`
          : `SkillJury has not found same-category alternatives for ${skill.name} yet.`,
    },
    {
      question: `How do I install ${skill.name}?`,
      answer:
        skill.installCommand ??
        "The source listing does not publish an install command for this skill.",
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 lg:px-10 lg:py-14">
      <JsonLd data={buildFaqJsonLd(faqEntries)} />
      {reviewBundle.summary.approvedCount > 0 && reviewBundle.summary.overallAverage ? (
        <JsonLd
          data={buildAggregateRatingJsonLd({
            canonicalPath: `/skills/${skill.slug}`,
            description:
              skill.shortSummary ??
              `${skill.name} has public ratings and reviews on SkillJury.`,
            name: skill.name,
            ratingValue: reviewBundle.summary.overallAverage,
            reviewCount: reviewBundle.summary.approvedCount,
          })}
        />
      ) : null}

      <SkillHero
        canReview={Boolean(viewer.user)}
        hasExistingReview={Boolean(reviewBundle.viewerReview)}
        requestCount={reviewRequestSummary.totalCount}
        reviewSummary={reviewBundle.summary}
        skill={skill}
        viewerHasRequestedReview={reviewRequestSummary.viewerHasRequested}
      />

      <QuickFacts
        averageRating={reviewBundle.summary.overallAverage}
        categoryLabel={categoryLabel}
        installCommand={skill.installCommand}
        lastUpdatedAt={lastUpdatedAt}
        recommendationPercentage={reviewBundle.summary.recommendationPercentage}
        reviewCount={reviewBundle.summary.approvedCount}
        skillName={skill.name}
        sourceLabel={sourceLabel}
        summary={skill.shortSummary}
        supportsAgents={agentLabel}
      />

      <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-8">
          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
            <div className="text-xs uppercase tracking-[0.28em] text-slate-500">
              About this skill
            </div>
            <div className="mt-4 whitespace-pre-line text-base leading-8 text-slate-700">
              {skill.longDescription ??
                "A long-form description has not been imported for this skill yet."}
            </div>
          </section>

          <TaxonomyLinks
            agents={skill.agentInstallData.map((agent) => ({
              name: agent.agentName,
              slug: agent.agentSlug,
            }))}
            categories={skill.categories}
            source={skill.source}
          />

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <RecommendationSummary summary={reviewBundle.summary} />
            <RatingDistribution summary={reviewBundle.summary} />
          </div>

          <section className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.28em] text-slate-500">
                  Community Reviews
                </div>
                <h2 className="mt-3 font-display text-4xl tracking-tight text-slate-950">
                  Latest approved reviews
                </h2>
              </div>
              <Link
                className="text-sm font-medium text-slate-950 underline decoration-slate-300 underline-offset-4"
                href={`/skills/${skill.slug}/reviews`}
              >
                View all reviews
              </Link>
            </div>
            <ReviewList
              actionHref={
                viewer.user
                  ? `/skills/${skill.slug}/review`
                  : `/login?next=${encodeURIComponent(`/skills/${skill.slug}/review`)}`
              }
              actionLabel={viewer.user ? "Write a review" : "Sign in to review"}
              emptyCopy="No approved reviews are live for this skill yet. Use the review CTA to add the first one."
              items={reviewBundle.items}
              loginHref={`/login?next=${encodeURIComponent(`/skills/${skill.slug}`)}`}
              reportTarget={{
                isSignedIn: Boolean(viewer.user),
                turnstileSiteKey: getTurnstileSiteKey(),
              }}
            />
          </section>

          <SkillFaqSection alternatives={alternatives} faqs={faqEntries} />
        </div>

        <SkillMetaPanel
          canReport={Boolean(viewer.user)}
          lastUpdatedAt={lastUpdatedAt}
          reportLoginHref={`/login?next=${encodeURIComponent(`/skills/${skill.slug}`)}`}
          requestCount={reviewRequestSummary.totalCount}
          reviewSummary={reviewBundle.summary}
          skill={skill}
          turnstileSiteKey={getTurnstileSiteKey()}
        />
      </div>

      <RelatedSkills
        skills={relatedBySource}
        title={skill.source ? `More from ${skill.source.name}` : "More related skills"}
      />

      {relatedByCategory.length > 0 ? (
        <RelatedSkills
          skills={relatedByCategory}
          title={`Alternatives in ${skill.categories[0]?.name ?? "this category"}`}
        />
      ) : null}
    </div>
  );
}

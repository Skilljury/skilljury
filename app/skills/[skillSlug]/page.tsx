import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/JsonLd";
import { RatingDistribution } from "@/components/reviews/RatingDistribution";
import { RecommendationSummary } from "@/components/reviews/RecommendationSummary";
import { ReviewList } from "@/components/reviews/ReviewList";
import { ReportDialog } from "@/components/reports/ReportDialog";
import { RelatedSkills } from "@/components/skills/RelatedSkills";
import { SecurityAudits } from "@/components/skills/SecurityAudits";
import { SkillFaqSection } from "@/components/skills/SkillFaqSection";
import { TaxonomyLinks } from "@/components/skills/TaxonomyLinks";
import { CopyButton } from "@/components/ui/CopyButton";
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
  buildBreadcrumbJsonLd,
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

function normalizeComparableText(value: string | null) {
  return value?.replace(/\s+/g, " ").trim() ?? null;
}

function formatDate(value: string | null) {
  if (!value) {
    return null;
  }

  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatInstallCount(value: number | null) {
  if (!value) {
    return null;
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: value >= 1000 ? 1 : 0,
    notation: value >= 1000 ? "compact" : "standard",
  }).format(value);
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

  const isThinSkillPage =
    !skill.shortSummary &&
    !skill.longDescription &&
    skill.approvedReviewCount === 0;

  return buildPageMetadata({
    title: `${skill.name} Review - Ratings, Alternatives & User Reviews | SkillJury`,
    description:
      skill.shortSummary ??
      `Inspect ${skill.name} on SkillJury, including user ratings, install context, and source metadata.`,
    indexable: !isThinSkillPage,
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
  const sourceLabel = skill.source?.name ?? "skills.sh import";
  const lastUpdatedAt = maxDate(
    skill.lastSyncedAt,
    reviewBundle.summary.lastApprovedReviewAt,
  );
  const normalizedSummary = normalizeComparableText(skill.shortSummary);
  const normalizedDescription = normalizeComparableText(skill.longDescription);
  const showAboutSection = Boolean(
    normalizedDescription && normalizedDescription !== normalizedSummary,
  );
  const showReviewInsights = reviewBundle.summary.approvedCount > 0;
  const installCountLabel =
    formatInstallCount(skill.weeklyInstalls) ??
    formatInstallCount(skill.totalInstalls);
  const reviewActionHref = viewer.user
    ? `/skills/${skill.slug}/review`
    : `/login?next=${encodeURIComponent(`/skills/${skill.slug}/review`)}`;
  const reviewActionLabel = viewer.user
    ? reviewBundle.viewerReview
      ? "Update your review"
      : "Write a review"
    : "Sign in to review";
  const quickFacts = [
    sourceLabel
      ? { label: "Source", value: sourceLabel }
      : null,
    formatDate(lastUpdatedAt)
      ? { label: "Last updated", value: formatDate(lastUpdatedAt) as string }
      : null,
    formatDate(skill.firstSeenAt)
      ? { label: "First seen", value: formatDate(skill.firstSeenAt) as string }
      : null,
    (skill.repository?.stars ?? 0) > 0
      ? {
          label: "GitHub stars",
          value: (skill.repository?.stars ?? 0).toLocaleString("en-US"),
        }
      : null,
    reviewRequestSummary.totalCount > 0
      ? {
          label: "Requests",
          value: reviewRequestSummary.totalCount.toLocaleString("en-US"),
        }
      : null,
    skill.categories.length > 0
      ? {
          label: "Categories",
          value: skill.categories.length.toLocaleString("en-US"),
        }
      : null,
  ]
    .filter(Boolean)
    .slice(0, 4) as Array<{ label: string; value: string }>;
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
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    ...(skill.categories[0]
      ? [
          {
            name: skill.categories[0].name,
            path: `/categories/${skill.categories[0].slug}`,
          },
        ]
      : []),
    { name: skill.name, path: `/skills/${skill.slug}` },
  ];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <JsonLd data={buildBreadcrumbJsonLd(breadcrumbItems)} />
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

      <Link
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-default hover:text-foreground"
        href="/"
      >
        <span aria-hidden="true">←</span>
        <span>Back to registry</span>
      </Link>

      <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          <section className="space-y-5">
            <div className="space-y-2">
              <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground">
                {skill.name}
              </h1>
              <p className="text-lg text-muted-foreground">{sourceLabel}</p>
              {skill.shortSummary ? (
                <p className="max-w-2xl text-xl leading-relaxed text-foreground">
                  {skill.shortSummary}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-3">
              {installCountLabel ? (
                <div className="rounded-lg border border-border bg-secondary px-4 py-2 font-mono text-sm text-secondary-foreground">
                  <span className="mr-3 text-[10px] uppercase tracking-[0.34em] text-muted-foreground">
                    Installs
                  </span>
                  <span>{installCountLabel}</span>
                </div>
              ) : null}
            </div>

            {skill.installCommand ? (
              <div className="rounded-lg border border-border bg-card/70 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground">
                    Install command
                  </div>
                  <CopyButton text={skill.installCommand} />
                </div>
                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-all font-mono text-sm text-foreground">
                  {skill.installCommand}
                </pre>
              </div>
            ) : null}
          </section>

          <SecurityAudits audits={skill.securityAudits} />

          {showAboutSection ? (
            <section className="rounded-lg border border-border bg-card/70 p-6">
              <div className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground">
                About this skill
              </div>
              <div className="mt-4 whitespace-pre-line text-base leading-8 text-foreground/85">
                {skill.longDescription}
              </div>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                Source description provided by the upstream skill listing. Community
                reviews and install context appear in the sections below.
              </p>
            </section>
          ) : null}

          {showReviewInsights ? (
            <section className="space-y-6">
              <div className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground">
                Review summary
              </div>
              <RecommendationSummary summary={reviewBundle.summary} />
              <RatingDistribution summary={reviewBundle.summary} />
            </section>
          ) : null}

          <section className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground">
                  Community Reviews
                </div>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                  Latest reviews
                </h2>
              </div>
              {reviewBundle.summary.approvedCount > 0 ? (
                <Link
                  className="text-sm text-muted-foreground transition-default hover:text-foreground"
                  href={`/skills/${skill.slug}/reviews`}
                >
                  View all reviews
                </Link>
              ) : null}
            </div>
            <Link
              className="block w-full rounded-lg border border-border bg-card px-4 py-4 text-center text-sm font-semibold uppercase tracking-[0.18em] text-foreground transition-default hover:border-white/20 hover:bg-surface-hover"
              href={reviewActionHref}
            >
              {reviewActionLabel}
            </Link>
            <ReviewList
              emptyCopy="No community reviews yet. Be the first to review."
              items={reviewBundle.items}
              loginHref={`/login?next=${encodeURIComponent(`/skills/${skill.slug}`)}`}
              reportTarget={{
                isSignedIn: Boolean(viewer.user),
                turnstileSiteKey: getTurnstileSiteKey(),
              }}
            />
          </section>

          <TaxonomyLinks
            agents={skill.agentInstallData.map((agent) => ({
              name: agent.agentName,
              slug: agent.agentSlug,
            }))}
            categories={skill.categories}
            source={skill.source}
          />

          <SkillFaqSection alternatives={alternatives} faqs={faqEntries} />
        </div>

        <aside className="h-fit space-y-6 rounded-lg border border-border p-6">
          {skill.agentInstallData.length > 0 ? (
            <section className="space-y-3">
              <div className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground">
                Compatible agents
              </div>
              <div className="flex flex-wrap gap-2">
                {skill.agentInstallData.map((agent) => (
                  <Link
                    key={`${agent.agentSlug}-${agent.installCount}`}
                    className="rounded bg-secondary px-2 py-1 text-[11px] font-medium text-secondary-foreground transition-default hover:bg-surface-hover"
                    href={`/agents/${agent.agentSlug}`}
                  >
                    {agent.agentName}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {quickFacts.length > 0 ? (
            <section className="space-y-4">
              <div className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground">
                Quick facts
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {quickFacts.map((item) => (
                  <div key={item.label}>
                    <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {item.label}
                    </div>
                    <div className="break-all text-sm font-mono text-foreground">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {skill.repository?.repositoryUrl ? (
            <section className="space-y-3">
              <div className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground">
                Repository
              </div>
              <a
                className="break-all text-sm text-foreground transition-default hover:text-primary"
                href={skill.repository.repositoryUrl}
                rel="noreferrer"
                target="_blank"
              >
                {skill.repository.ownerName}/{skill.repository.repositoryName}
              </a>
            </section>
          ) : null}

          {skill.documentationUrl ? (
            <section className="space-y-3">
              <div className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground">
                Documentation
              </div>
              <a
                className="break-all text-sm text-foreground transition-default hover:text-primary"
                href={skill.documentationUrl}
                rel="noreferrer"
                target="_blank"
              >
                {skill.documentationUrl}
              </a>
            </section>
          ) : null}

          {skill.canonicalSourceUrl ? (
            <section className="space-y-3">
              <div className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground">
                Canonical source
              </div>
              <a
                className="break-all text-sm text-foreground transition-default hover:text-primary"
                href={skill.canonicalSourceUrl}
                rel="noreferrer"
                target="_blank"
              >
                {skill.canonicalSourceUrl}
              </a>
            </section>
          ) : null}

          <section className="space-y-3">
            <div className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground">
              Report listing
            </div>
            <p className="text-sm text-muted-foreground">
              Flag wrong metadata, spam, or copyright issues for moderator review.
            </p>
            <ReportDialog
              isSignedIn={Boolean(viewer.user)}
              loginHref={`/login?next=${encodeURIComponent(`/skills/${skill.slug}`)}`}
              targetId={String(skill.id)}
              targetLabel="listing"
              targetType="skill"
              turnstileSiteKey={getTurnstileSiteKey()}
            />
          </section>
        </aside>
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

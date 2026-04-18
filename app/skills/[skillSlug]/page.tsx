import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { JsonLd } from "@/components/seo/JsonLd";
import { RatingDistribution } from "@/components/reviews/RatingDistribution";
import { RecommendationSummary } from "@/components/reviews/RecommendationSummary";
import { ReviewList } from "@/components/reviews/ReviewList";
import { ReportDialog } from "@/components/reports/ReportDialog";
import { RelatedSkills } from "@/components/skills/RelatedSkills";
import { RequestReviewButton } from "@/components/skills/RequestReviewButton";
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
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildSoftwareApplicationJsonLd,
} from "@/lib/seo/schema";
import { buildSkillMetadataTitle } from "@/lib/seo/titleTemplates";
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
    title: buildSkillMetadataTitle(skill.name),
    description:
      skill.shortSummary ??
      `Install ${skill.name}, read community reviews, check agent compatibility, and compare alternatives on SkillJury.`,
    indexable: !isThinSkillPage,
    pathname: `/skills/${skill.slug}`,
  });
}

function SkillPageSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <div className="h-4 w-40 animate-pulse rounded bg-muted/30" />
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.85fr)]">
        <div className="rounded-[2rem] border border-border bg-card/80 p-7 shadow-sm sm:p-8">
          <div className="h-4 w-32 animate-pulse rounded bg-muted/30" />
          <div className="mt-6 h-12 w-3/4 animate-pulse rounded bg-muted/40" />
          <div className="mt-4 h-5 w-full animate-pulse rounded bg-muted/30" />
          <div className="mt-2 h-5 w-5/6 animate-pulse rounded bg-muted/30" />
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="h-24 animate-pulse rounded bg-muted/30" />
            <div className="h-24 animate-pulse rounded bg-muted/30" />
            <div className="h-24 animate-pulse rounded bg-muted/30" />
          </div>
        </div>
        <aside className="space-y-5">
          <div className="h-64 animate-pulse rounded-[1.5rem] bg-muted/30" />
          <div className="h-40 animate-pulse rounded-[1.5rem] bg-muted/30" />
        </aside>
      </section>
    </div>
  );
}

async function SkillPageContent({
  params,
}: {
  params: Promise<{ skillSlug: string }>;
}) {
  const { skillSlug } = await params;
  const [viewer, skill] = await Promise.all([
    getCurrentViewer(),
    getSkillBySlug(skillSlug),
  ]);

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
  const lastUpdatedLabel = formatDate(lastUpdatedAt);
  const firstSeenLabel = formatDate(skill.firstSeenAt);
  const reviewVerdictLabel =
    reviewBundle.summary.overallAverage !== null
      ? `${reviewBundle.summary.overallAverage.toFixed(1)}/5`
      : "Pending";
  const recommendationLabel =
    reviewBundle.summary.recommendationPercentage !== null
      ? `${reviewBundle.summary.recommendationPercentage}%`
      : "Pending";
  const quickFacts = [
    sourceLabel ? { label: "Source", value: sourceLabel } : null,
    lastUpdatedLabel ? { label: "Last updated", value: lastUpdatedLabel } : null,
    firstSeenLabel ? { label: "First seen", value: firstSeenLabel } : null,
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
  const hasSecurityAudits = Boolean(
    skill.securityAudits &&
      Object.values(skill.securityAudits).some((status) => Boolean(status)),
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
      question: `Which AI agents support ${skill.name}?`,
      answer: `${skill.name} currently lists compatibility with ${agentLabel}.`,
    },
    {
      question: `Is ${skill.name} safe to install?`,
      answer: hasSecurityAudits
        ? `${skill.name} has been scanned by security audit providers tracked on SkillJury. Check the security audits section on this page for detailed results from Socket.dev and Snyk.`
        : `SkillJury has not yet received security audit results for ${skill.name}. Review the source repository and install command before installing.`,
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
        skill.installCommand
          ? `Run the following command to install ${skill.name}: ${skill.installCommand}`
          : "The source listing does not publish an install command for this skill.",
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
    <>
      <JsonLd data={buildBreadcrumbJsonLd(breadcrumbItems)} />
      <JsonLd data={buildFaqJsonLd(faqEntries)} />
      <JsonLd
        data={buildSoftwareApplicationJsonLd({
          canonicalPath: `/skills/${skill.slug}`,
          dateModified: skill.lastSyncedAt,
          datePublished: skill.firstSeenAt,
          description:
            skill.shortSummary ??
            `${skill.name} is an AI agent skill listed on SkillJury.`,
          name: skill.name,
          ratingValue: reviewBundle.summary.overallAverage,
          reviewCount: reviewBundle.summary.approvedCount,
          reviews: reviewBundle.items
            .filter((r) => r.body || r.pros)
            .slice(0, 5)
            .map((r) => ({
              author:
                r.user?.displayName ?? r.user?.username ?? "Anonymous",
              datePublished: r.publishedAt ?? r.createdAt,
              ratingValue: r.overallRating,
              reviewBody: r.body ?? `Pros: ${r.pros}. Cons: ${r.cons}`,
            })),
        })}
      />

      <Link
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-default hover:text-foreground"
        href="/search"
      >
        <span aria-hidden="true">{`<-`}</span>
        <span>Back to the directory</span>
      </Link>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.85fr)]">
        <div className="rounded-[2rem] border border-border bg-card/80 p-7 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            <span>{sourceLabel}</span>
            {skill.categories.slice(0, 2).map((category) => (
              <span
                className="rounded-full border border-border bg-background/60 px-3 py-1 tracking-[0.16em]"
                key={category.slug}
              >
                {category.name}
              </span>
            ))}
          </div>

          <div className="mt-6 max-w-4xl space-y-4">
            <h1 className="text-balance text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">
              {skill.name}
            </h1>
            <p className="max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
              {skill.shortSummary ??
                "SkillJury is still gathering richer source copy for this listing. Community reviews, install context, and source proof are shown below."}
            </p>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
              SkillJury keeps community verdicts, source metadata, and external repository
              signals in separate lanes so ranking data never pretends to be a review.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.25rem] border border-border bg-background/80 p-4">
              <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                SkillJury verdict
              </div>
              <div className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-foreground">
                {reviewVerdictLabel}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {reviewBundle.summary.approvedCount > 0
                  ? `${reviewBundle.summary.approvedCount.toLocaleString("en-US")} approved reviews`
                  : "No approved reviews yet"}
              </p>
            </div>

            <div className="rounded-[1.25rem] border border-border bg-background/80 p-4">
              <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                Would recommend
              </div>
              <div className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-foreground">
                {recommendationLabel}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {reviewBundle.summary.recommendationPercentage !== null
                  ? "From published community reviews"
                  : "Waiting on enough review volume"}
              </p>
            </div>

            <div className="rounded-[1.25rem] border border-border bg-background/80 p-4">
              <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                Install signal
              </div>
              <div className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-foreground">
                {installCountLabel ?? "Unknown"}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Weekly or total install activity from catalog data
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="inline-flex items-center justify-center rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-default hover:opacity-90"
              href={reviewActionHref}
            >
              {reviewActionLabel}
            </Link>
            {reviewBundle.summary.approvedCount > 0 ? (
              <Link
                className="inline-flex items-center justify-center rounded-full border border-border bg-background/70 px-5 py-3 text-sm font-medium text-foreground transition-default hover:bg-surface-hover"
                href={`/skills/${skill.slug}/reviews`}
              >
                Browse all reviews
              </Link>
            ) : null}
            <RequestReviewButton
              isSignedIn={Boolean(viewer.user)}
              loginHref={`/login?next=${encodeURIComponent(`/skills/${skill.slug}`)}`}
              requestCount={reviewRequestSummary.totalCount}
              skillSlug={skill.slug}
              viewerHasRequested={reviewRequestSummary.viewerHasRequested}
            />
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-border bg-background/80 p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                Install command
              </div>
              {skill.installCommand ? <CopyButton text={skill.installCommand} /> : null}
            </div>
            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap break-all text-sm leading-7 text-foreground">
              {skill.installCommand ?? "Install command not available from the source."}
            </pre>
          </div>
        </div>

        <aside className="space-y-5">
          <section className="rounded-[1.5rem] border border-border bg-card/80 p-6 shadow-sm">
            <div className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
              Catalog facts
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              {quickFacts.map((item) => (
                <div key={item.label}>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    {item.label}
                  </div>
                  <div className="mt-2 break-all text-sm text-foreground">{item.value}</div>
                </div>
              ))}
            </div>
          </section>

          {skill.agentInstallData.length > 0 ? (
            <section className="rounded-[1.5rem] border border-border bg-card/80 p-6 shadow-sm">
              <div className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                Compatible agents
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {skill.agentInstallData.map((agent) => (
                  <Link
                    key={`${agent.agentSlug}-${agent.installCount}`}
                    className="rounded-full border border-border bg-background/75 px-3 py-2 text-sm text-foreground transition-default hover:bg-surface-hover"
                    href={`/agents/${agent.agentSlug}`}
                  >
                    {agent.agentName}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <section className="rounded-[1.5rem] border border-border bg-card/80 p-6 shadow-sm">
            <div className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
              Source proof
            </div>
            <div className="mt-5 space-y-4 text-sm">
              {skill.repository?.repositoryUrl ? (
                <div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    Repository
                  </div>
                  <a
                    className="mt-2 block break-all text-foreground transition-default hover:text-primary"
                    href={skill.repository.repositoryUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {skill.repository.ownerName}/{skill.repository.repositoryName}
                  </a>
                </div>
              ) : null}

              {skill.documentationUrl ? (
                <div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    Documentation
                  </div>
                  <a
                    className="mt-2 block break-all text-foreground transition-default hover:text-primary"
                    href={skill.documentationUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {skill.documentationUrl}
                  </a>
                </div>
              ) : null}

              <div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  Canonical source
                </div>
                {skill.canonicalSourceUrl ? (
                  <a
                    className="mt-2 block break-all text-foreground transition-default hover:text-primary"
                    href={skill.canonicalSourceUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {skill.canonicalSourceUrl}
                  </a>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Canonical source unavailable.
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-border bg-card/80 p-6 shadow-sm">
            <div className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
              Report listing
            </div>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Flag wrong metadata, spam, or copyright issues for moderator review.
            </p>
            <div className="mt-4">
              <ReportDialog
                isSignedIn={Boolean(viewer.user)}
                loginHref={`/login?next=${encodeURIComponent(`/skills/${skill.slug}`)}`}
                targetId={String(skill.id)}
                targetLabel="listing"
                targetType="skill"
                turnstileSiteKey={getTurnstileSiteKey()}
              />
            </div>
          </section>
        </aside>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        {showReviewInsights ? <RecommendationSummary summary={reviewBundle.summary} /> : null}
        {showReviewInsights ? (
          <div className="rounded-[1.5rem] border border-border bg-card/75 p-6 shadow-sm">
            <RatingDistribution summary={reviewBundle.summary} />
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-border bg-card/50 p-6 text-sm leading-7 text-muted-foreground">
            SkillJury does not have enough approved reviews to publish a community verdict yet.
            Source metadata and repository proof are still available above.
          </div>
        )}
      </section>

      <section className="rounded-[1.5rem] border border-primary/10 bg-card/75 p-6 shadow-sm">
        <div className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
          SkillJury Signal Summary
        </div>
        <p className="mt-4 text-sm leading-7 text-foreground/85">
          As of {lastUpdatedLabel ?? "the latest sync"}, {skill.name} has{" "}
          {installCountLabel
            ? `${installCountLabel} weekly installs`
            : "no reported install data"}
          , {reviewBundle.summary.approvedCount} community{" "}
          {reviewBundle.summary.approvedCount === 1 ? "review" : "reviews"}
          {reviewBundle.summary.overallAverage
            ? `, and a confidence score of ${reviewBundle.summary.overallAverage.toFixed(1)}/5`
            : ""}{" "}
          on SkillJury.
          {skill.source ? ` Source: ${skill.source.name}.` : ""}
          {skill.canonicalSourceUrl ? ` Canonical URL: ${skill.canonicalSourceUrl}.` : ""}
        </p>
      </section>

      {hasSecurityAudits ? (
        <section className="rounded-[1.5rem] border border-border bg-card/75 p-6 shadow-sm">
          <SecurityAudits audits={skill.securityAudits} />
        </section>
      ) : null}

      {showAboutSection ? (
        <section className="rounded-[1.5rem] border border-border bg-card/75 p-6 shadow-sm">
          <div className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
            About this skill
          </div>
          <div className="mt-5 whitespace-pre-line text-base leading-8 text-foreground/85">
            {skill.longDescription}
          </div>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Source description provided by the upstream listing. Community review signal
            and install context stay separate from this narrative layer.
          </p>
        </section>
      ) : null}

      <section className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
              Community reviews
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-foreground">
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
    </>
  );
}

export default function SkillPage({ params }: SkillPageProps) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <Suspense fallback={<SkillPageSkeleton />}>
        <SkillPageContent params={params} />
      </Suspense>
    </div>
  );
}

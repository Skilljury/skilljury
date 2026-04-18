import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { PaginationNav } from "@/components/listing/PaginationNav";
import { RatingDistribution } from "@/components/reviews/RatingDistribution";
import { RecommendationSummary } from "@/components/reviews/RecommendationSummary";
import { ReviewList } from "@/components/reviews/ReviewList";
import { getCurrentViewer } from "@/lib/auth/session";
import { getSkillBySlug } from "@/lib/db/skills";
import { getSkillReviews } from "@/lib/reviews/getSkillReviews";
import { normalizePageParam } from "@/lib/routing/browseParams";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildSkillReviewArchiveTitle } from "@/lib/seo/titleTemplates";
import { getTurnstileSiteKey } from "@/lib/supabase/config";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type SkillReviewsPageProps = {
  params: Promise<{
    skillSlug: string;
  }>;
  searchParams: SearchParams;
};

export async function generateMetadata({
  params,
}: SkillReviewsPageProps): Promise<Metadata> {
  const { skillSlug } = await params;
  const skill = await getSkillBySlug(skillSlug);

  return buildPageMetadata({
    title: skill
      ? buildSkillReviewArchiveTitle(skill.name)
      : "Skill reviews | SkillJury",
    description: skill
      ? `Read public reviews and rating details for ${skill.name}.`
      : "Read public SkillJury reviews for this skill.",
    indexable: Boolean(skill?.approvedReviewCount),
    pathname: `/skills/${skillSlug}/reviews`,
  });
}

function SkillReviewsPageSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="h-48 animate-pulse rounded-[2rem] bg-muted/30" />
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="h-48 animate-pulse rounded-[1.5rem] bg-muted/30" />
        <div className="h-48 animate-pulse rounded-[1.5rem] bg-muted/30" />
      </div>
      <div className="h-96 animate-pulse rounded-[1.5rem] bg-muted/30" />
    </div>
  );
}

async function SkillReviewsContent({
  skillSlug,
  searchParams,
}: {
  skillSlug: string;
  searchParams: SearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const page = normalizePageParam(resolvedSearchParams.page);
  const viewer = await getCurrentViewer();
  const skill = await getSkillBySlug(skillSlug);

  if (!skill) {
    notFound();
  }

  const reviewBundle = await getSkillReviews({
    page,
    pageSize: 12,
    skillId: skill.id,
    viewerUserId: viewer.user?.id ?? null,
  });
  const showReviewInsights =
    reviewBundle.summary.approvedCount > 0 ||
    reviewBundle.summary.distribution.some((entry) => entry.count > 0);

  return (
    <>
      <section className="rounded-[2rem] border border-border bg-card/80 p-7 shadow-sm">
        <Link
          className="inline-flex items-center rounded-full border border-border bg-background px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/20 hover:bg-card hover:text-foreground"
          href={`/skills/${skill.slug}`}
        >
          Back to {skill.name}
        </Link>
        <div className="mt-5 text-xs uppercase tracking-[0.28em] text-muted-foreground">
          Review archive
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {skill.name} ratings and user reviews
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground">
          Approved reviews only. Pending moderation items stay hidden until a moderator
          publishes them.
        </p>
      </section>

      {showReviewInsights ? (
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <RecommendationSummary summary={reviewBundle.summary} />
          <RatingDistribution summary={reviewBundle.summary} />
        </div>
      ) : null}

      <ReviewList
        actionHref={
          viewer.user
            ? `/skills/${skill.slug}/review`
            : `/login?next=${encodeURIComponent(`/skills/${skill.slug}/review`)}`
        }
        actionLabel={viewer.user ? "Write a review" : "Sign in to review"}
        items={reviewBundle.items}
        loginHref={`/login?next=${encodeURIComponent(`/skills/${skill.slug}/reviews`)}`}
        reportTarget={{
          isSignedIn: Boolean(viewer.user),
          turnstileSiteKey: getTurnstileSiteKey(),
        }}
      />

      <PaginationNav
        basePath={`/skills/${skill.slug}/reviews`}
        page={reviewBundle.page}
        totalPages={reviewBundle.totalPages}
      />
    </>
  );
}

export default async function SkillReviewsPage({
  params,
  searchParams,
}: SkillReviewsPageProps) {
  const { skillSlug } = await params;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 lg:px-10 lg:py-14">
      <Suspense fallback={<SkillReviewsPageSkeleton />}>
        <SkillReviewsContent skillSlug={skillSlug} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

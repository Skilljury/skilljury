import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PaginationNav } from "@/components/listing/PaginationNav";
import { RatingDistribution } from "@/components/reviews/RatingDistribution";
import { RecommendationSummary } from "@/components/reviews/RecommendationSummary";
import { ReviewList } from "@/components/reviews/ReviewList";
import { getCurrentViewer } from "@/lib/auth/session";
import { getSkillBySlug } from "@/lib/db/skills";
import { getSkillReviews } from "@/lib/reviews/getSkillReviews";
import { normalizePageParam } from "@/lib/routing/browseParams";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getTurnstileSiteKey } from "@/lib/supabase/config";

type SkillReviewsPageProps = {
  params: Promise<{
    skillSlug: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: SkillReviewsPageProps): Promise<Metadata> {
  const { skillSlug } = await params;
  const skill = await getSkillBySlug(skillSlug);

  return buildPageMetadata({
    title: skill
      ? `${skill.name} reviews | SkillJury`
      : "Skill reviews | SkillJury",
    description: skill
      ? `Read public reviews and rating details for ${skill.name}.`
      : "Read public SkillJury reviews for this skill.",
    pathname: `/skills/${skillSlug}/reviews`,
  });
}

export default async function SkillReviewsPage({
  params,
  searchParams,
}: SkillReviewsPageProps) {
  const { skillSlug } = await params;
  const resolvedSearchParams = await searchParams;
  const viewer = await getCurrentViewer();
  const skill = await getSkillBySlug(skillSlug);

  if (!skill) {
    notFound();
  }

  const page = normalizePageParam(resolvedSearchParams.page);
  const reviewBundle = await getSkillReviews({
    page,
    pageSize: 12,
    skillId: skill.id,
    viewerUserId: viewer.user?.id ?? null,
  });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 lg:px-10 lg:py-14">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
        <div className="text-xs uppercase tracking-[0.28em] text-slate-500">
          Review archive
        </div>
        <h1 className="mt-4 font-display text-5xl tracking-tight text-slate-950">
          {skill.name} ratings and user reviews
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
          Approved reviews only. Pending moderation items stay hidden until a moderator
          publishes them.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <RecommendationSummary summary={reviewBundle.summary} />
        <RatingDistribution summary={reviewBundle.summary} />
      </div>

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
    </div>
  );
}

import { Badge } from "@/components/ui/Badge";
import type { SkillDetail } from "@/lib/db/skills";
import type { ReviewAggregateSummary } from "@/lib/reviews/aggregateRatings";
import Link from "next/link";

import { RequestReviewButton } from "@/components/skills/RequestReviewButton";

type SkillHeroProps = {
  canReview: boolean;
  hasExistingReview: boolean;
  requestCount: number;
  reviewSummary: ReviewAggregateSummary;
  skill: SkillDetail;
  viewerHasRequestedReview: boolean;
};

export function SkillHero({
  canReview,
  hasExistingReview,
  requestCount,
  reviewSummary,
  skill,
  viewerHasRequestedReview,
}: SkillHeroProps) {
  const reviewHref = canReview
    ? `/skills/${skill.slug}/review`
    : `/login?next=${encodeURIComponent(`/skills/${skill.slug}/review`)}`;
  const requestHref = `/login?next=${encodeURIComponent(`/skills/${skill.slug}`)}`;
  const heroSummary = skill.shortSummary;

  return (
    <section className="rounded-xl border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,22,0.96),rgba(10,10,12,0.92))] p-7 text-white shadow-xl">
      <div className="flex flex-wrap items-center gap-3">
        <Badge tone="accent">{skill.source?.name ?? "skills.sh import"}</Badge>
        <Badge>{(skill.weeklyInstalls ?? 0).toLocaleString("en-US")} weekly installs</Badge>
        {reviewSummary.overallAverage ? (
          <Badge>{`${reviewSummary.overallAverage.toFixed(2)}/5`}</Badge>
        ) : (
          <span className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-zinc-500">
            Not reviewed yet
          </span>
        )}
        {reviewSummary.approvedCount > 0 ? (
          <Badge>{reviewSummary.approvedCount} reviews</Badge>
        ) : null}
      </div>

      <div className="mt-6 space-y-4">
        <h1 className="text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
          {skill.name}
        </h1>
        {heroSummary ? (
          <p className="max-w-3xl text-lg leading-8 text-zinc-400">{heroSummary}</p>
        ) : (
          <p className="max-w-3xl text-base leading-7 text-zinc-500">
            Source summary unavailable. Install details, review status, and source links
            are still listed below.
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          className="rounded-lg bg-white px-5 py-3 text-sm font-medium text-zinc-950 transition hover:bg-zinc-100"
          href={hasExistingReview ? `/skills/${skill.slug}/reviews` : reviewHref}
        >
          {hasExistingReview
            ? "View your review"
            : reviewSummary.approvedCount === 0
              ? canReview
                ? "Be the first to review"
                : "Sign in to review"
              : canReview
                ? "Write a review"
              : "Sign in to review"}
        </Link>
        {reviewSummary.approvedCount > 0 ? (
          <Link
            className="rounded-lg border border-white/15 px-5 py-3 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/8"
            href={`/skills/${skill.slug}/reviews`}
          >
            Browse all reviews
          </Link>
        ) : null}
        <RequestReviewButton
          isSignedIn={canReview}
          loginHref={requestHref}
          requestCount={requestCount}
          skillSlug={skill.slug}
          viewerHasRequested={viewerHasRequestedReview}
        />
      </div>

      <div className="mt-8 rounded-lg border border-white/10 bg-white/6 p-5">
        <div className="text-xs uppercase tracking-[0.28em] text-zinc-500">
          Install command
        </div>
        <code className="mt-3 block overflow-x-auto font-mono text-sm text-zinc-100">
          {skill.installCommand ?? "Install command not available from source."}
        </code>
      </div>
    </section>
  );
}

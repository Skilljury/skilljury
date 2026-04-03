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
    <section className="rounded-[2rem] border border-border bg-card/85 p-7 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <Badge tone="accent">{skill.source?.name ?? "skills.sh import"}</Badge>
        <Badge>{(skill.weeklyInstalls ?? 0).toLocaleString("en-US")} weekly installs</Badge>
        {reviewSummary.overallAverage ? (
          <Badge>{`${reviewSummary.overallAverage.toFixed(2)}/5`}</Badge>
        ) : (
          <span className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
            Not reviewed yet
          </span>
        )}
        {reviewSummary.approvedCount > 0 ? (
          <Badge>{reviewSummary.approvedCount} reviews</Badge>
        ) : null}
      </div>

      <div className="mt-6 space-y-4">
        <h1 className="text-5xl font-semibold leading-tight tracking-tight text-foreground sm:text-6xl">
          {skill.name}
        </h1>
        {heroSummary ? (
          <p className="max-w-3xl text-lg leading-8 text-muted-foreground">{heroSummary}</p>
        ) : (
          <p className="max-w-3xl text-base leading-7 text-muted-foreground">
            Source summary unavailable. Install details, review status, and source links
            are still listed below.
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          className="rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-95"
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
            className="rounded-full border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition hover:border-primary/20 hover:bg-card"
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

      <div className="mt-8 rounded-[1.5rem] border border-border bg-background/80 p-5">
        <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
          Install command
        </div>
        <code className="mt-3 block overflow-x-auto font-mono text-sm text-foreground">
          {skill.installCommand ?? "Install command not available from source."}
        </code>
      </div>
    </section>
  );
}

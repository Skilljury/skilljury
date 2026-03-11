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

  return (
    <section className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(247,212,138,0.14),transparent_35%),linear-gradient(135deg,#0b1020,#111827_55%,#0f172a)] p-7 text-white shadow-[0_35px_100px_rgba(0,0,0,0.45)]">
      <div className="flex flex-wrap items-center gap-3">
        <Badge tone="accent">{skill.source?.name ?? "skills.sh import"}</Badge>
        <Badge>{(skill.weeklyInstalls ?? 0).toLocaleString("en-US")} weekly installs</Badge>
        <Badge>
          {reviewSummary.overallAverage
            ? `${reviewSummary.overallAverage.toFixed(2)}/5`
            : "No rating yet"}
        </Badge>
        <Badge>{reviewSummary.approvedCount} reviews</Badge>
      </div>

      <div className="mt-6 space-y-4">
        <h1 className="font-display text-5xl leading-tight tracking-tight sm:text-6xl">
          {skill.name} Skill Review - Ratings & User Reviews
        </h1>
        <p className="max-w-3xl text-lg leading-8 text-slate-300">
          {skill.shortSummary ??
            "This skill doesn't have a detailed summary yet. Be the first to write a review and help others evaluate it."}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          className="rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-100"
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
        <Link
          className="rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/8"
          href={`/skills/${skill.slug}/reviews`}
        >
          Browse all reviews
        </Link>
        <RequestReviewButton
          isSignedIn={canReview}
          loginHref={requestHref}
          requestCount={requestCount}
          skillSlug={skill.slug}
          viewerHasRequested={viewerHasRequestedReview}
        />
      </div>

      <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/6 p-5">
        <div className="text-xs uppercase tracking-[0.28em] text-slate-400">
          Install command
        </div>
        <code className="mt-3 block overflow-x-auto font-mono text-sm text-slate-100">
          {skill.installCommand ?? "Install command not available from source."}
        </code>
      </div>
    </section>
  );
}

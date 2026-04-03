import type { ReviewListItem } from "@/lib/reviews/getSkillReviews";

import { ReportDialog } from "@/components/reports/ReportDialog";

type ReviewCardProps = {
  loginHref?: string;
  reportTarget?: {
    isSignedIn: boolean;
    turnstileSiteKey: string;
  };
  review: ReviewListItem;
};

function labelRecommendation(value: ReviewListItem["wouldRecommend"]) {
  if (value === "with_caveats") {
    return "Would recommend with caveats";
  }

  if (value === "yes") {
    return "Would recommend";
  }

  return "Would not recommend";
}

function formatDate(value: string | null) {
  if (!value) {
    return "Unknown";
  }

  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ReviewCard({
  loginHref = "/login",
  reportTarget,
  review,
}: ReviewCardProps) {
  return (
    <article className="rounded-lg border border-border bg-card/60 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            {review.user?.displayName ?? review.user?.username ?? "Verified reviewer"}
            {review.user?.githubUsername
              ? ` | GitHub: ${review.user.githubUsername}`
              : ""}
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            {review.reviewTitle ?? labelRecommendation(review.wouldRecommend)}
          </h3>
        </div>
        <div className="text-left sm:text-right">
          <div className="font-mono text-2xl font-semibold text-foreground">
            {review.overallRating}/5
          </div>
          <div className="mt-1 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            {formatDate(review.publishedAt ?? review.createdAt)}
          </div>
        </div>
      </div>

      <div className="mt-4 inline-flex rounded-full border border-border bg-secondary px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-secondary-foreground">
        {labelRecommendation(review.wouldRecommend)}
      </div>

      {review.body ? (
        <p className="mt-5 text-sm leading-7 text-foreground/80">{review.body}</p>
      ) : null}

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface-elevated/70 p-4">
          <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            Pros
          </div>
          <p className="mt-2 text-sm leading-7 text-foreground">{review.pros}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface-elevated/70 p-4">
          <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            Cons
          </div>
          <p className="mt-2 text-sm leading-7 text-foreground">{review.cons}</p>
        </div>
      </div>

      {review.useCase || review.experienceLevel || review.proofOfUseUrl ? (
        <div className="mt-5 flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
          {review.useCase ? (
            <span className="rounded-full border border-border px-3 py-1">
              Use case: {review.useCase}
            </span>
          ) : null}
          {review.experienceLevel ? (
            <span className="rounded-full border border-border px-3 py-1">
              {review.experienceLevel}
            </span>
          ) : null}
          {review.proofOfUseUrl ? (
            <span className="rounded-full border border-border px-3 py-1">
              Proof attached
            </span>
          ) : null}
        </div>
      ) : null}

      {reportTarget ? (
        <div className="mt-5 border-t border-border pt-4">
          <ReportDialog
            isSignedIn={reportTarget.isSignedIn}
            loginHref={loginHref}
            targetId={String(review.id)}
            targetLabel="review"
            targetType="review"
            turnstileSiteKey={reportTarget.turnstileSiteKey}
          />
        </div>
      ) : null}
    </article>
  );
}

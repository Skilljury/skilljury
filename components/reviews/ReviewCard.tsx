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
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-slate-400">
            {review.user?.displayName ?? review.user?.username ?? "Verified reviewer"}
            {review.user?.githubUsername ? ` · GitHub: ${review.user.githubUsername}` : ""}
          </div>
          <h3 className="mt-3 text-xl font-semibold text-slate-950">
            {review.reviewTitle ?? labelRecommendation(review.wouldRecommend)}
          </h3>
        </div>
        <div className="text-right">
          <div className="font-mono text-2xl font-semibold text-slate-950">
            {review.overallRating}/5
          </div>
          <div className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-400">
            {formatDate(review.publishedAt ?? review.createdAt)}
          </div>
        </div>
      </div>

      <div className="mt-4 inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
        {labelRecommendation(review.wouldRecommend)}
      </div>

      {review.body ? (
        <p className="mt-5 text-sm leading-7 text-slate-700">{review.body}</p>
      ) : null}

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-[1.25rem] bg-emerald-50 p-4">
          <div className="text-[11px] uppercase tracking-[0.24em] text-emerald-700">
            Pros
          </div>
          <p className="mt-2 text-sm leading-7 text-emerald-950">{review.pros}</p>
        </div>
        <div className="rounded-[1.25rem] bg-rose-50 p-4">
          <div className="text-[11px] uppercase tracking-[0.24em] text-rose-700">
            Cons
          </div>
          <p className="mt-2 text-sm leading-7 text-rose-950">{review.cons}</p>
        </div>
      </div>

      {(review.useCase || review.experienceLevel || review.proofOfUseUrl) ? (
        <div className="mt-5 flex flex-wrap gap-3 text-xs text-slate-600">
          {review.useCase ? (
            <span className="rounded-full border border-slate-200 px-3 py-1">
              Use case: {review.useCase}
            </span>
          ) : null}
          {review.experienceLevel ? (
            <span className="rounded-full border border-slate-200 px-3 py-1">
              {review.experienceLevel}
            </span>
          ) : null}
          {review.proofOfUseUrl ? (
            <span className="rounded-full border border-slate-200 px-3 py-1">
              Proof attached
            </span>
          ) : null}
        </div>
      ) : null}

      {reportTarget ? (
        <div className="mt-5 border-t border-slate-200 pt-4">
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

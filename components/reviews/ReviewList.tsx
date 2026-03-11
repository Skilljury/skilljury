import type { ReviewListItem } from "@/lib/reviews/getSkillReviews";

import { ReviewCard } from "@/components/reviews/ReviewCard";
import { EmptyStatePrompt } from "@/components/ui/EmptyStatePrompt";

type ReviewListProps = {
  actionHref?: string;
  actionLabel?: string;
  emptyCopy?: string;
  items: ReviewListItem[];
  loginHref?: string;
  reportTarget?: {
    isSignedIn: boolean;
    turnstileSiteKey: string;
  };
};

export function ReviewList({
  actionHref,
  actionLabel,
  emptyCopy = "No approved reviews are live for this skill yet.",
  items,
  loginHref,
  reportTarget,
}: ReviewListProps) {
  if (items.length === 0) {
    return (
      <EmptyStatePrompt
        actionHref={actionHref}
        actionLabel={actionLabel}
        description={emptyCopy}
        title="No public reviews yet"
      />
    );
  }

  return (
    <div className="space-y-5">
      {items.map((review) => (
        <ReviewCard
          key={review.id}
          loginHref={loginHref}
          reportTarget={reportTarget}
          review={review}
        />
      ))}
    </div>
  );
}

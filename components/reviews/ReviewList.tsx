import type { ReviewListItem } from "@/lib/reviews/getSkillReviews";

import { ReviewCard } from "@/components/reviews/ReviewCard";

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
  emptyCopy = "No community reviews yet. Be the first to review.",
  items,
  loginHref,
  reportTarget,
}: ReviewListProps) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyCopy}</p>;
  }

  return (
    <div className="space-y-4">
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

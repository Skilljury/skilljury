import type { ReviewAggregateSummary } from "@/lib/reviews/aggregateRatings";

type RatingDistributionProps = {
  summary: ReviewAggregateSummary;
};

export function RatingDistribution({ summary }: RatingDistributionProps) {
  const hasDistribution = summary.distribution.some((entry) => entry.count > 0);

  if (!hasDistribution) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
        Rating spread
      </div>

      <div className="space-y-3">
        {summary.distribution.map((entry) => (
          <div
            className="grid grid-cols-[3rem_minmax(0,1fr)_2.5rem] items-center gap-3"
            key={entry.rating}
          >
            <span className="text-sm text-foreground/80">{entry.rating}/5</span>
            <div className="h-2 rounded-full bg-secondary">
              <div
                className="h-2 rounded-full bg-foreground/70"
                style={{ width: `${entry.percentage}%` }}
              />
            </div>
            <span className="text-right text-xs text-muted-foreground">
              {entry.count}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

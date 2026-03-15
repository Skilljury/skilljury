import type { ReviewAggregateSummary } from "@/lib/reviews/aggregateRatings";

type RecommendationSummaryProps = {
  summary: ReviewAggregateSummary;
};

function renderStars(rating: number) {
  const rounded = Math.round(rating);

  return Array.from({ length: 5 }, (_, index) => (
    <span
      className={index < rounded ? "text-foreground" : "text-muted-foreground/40"}
      key={`star:${index}`}
    >
      ★
    </span>
  ));
}

export function RecommendationSummary({
  summary,
}: RecommendationSummaryProps) {
  if (summary.approvedCount === 0 || summary.overallAverage === null) {
    return null;
  }

  const visibleSubscores = summary.subscores.filter(
    (subscore) => subscore.count >= 5 && subscore.average !== null,
  );

  return (
    <section className="space-y-5">
      <div className="text-[11px] font-bold uppercase tracking-[0.34em] text-muted-foreground">
        Review summary
      </div>
      <div className="space-y-3">
        <div className="font-mono text-5xl font-bold text-foreground">
          {summary.overallAverage.toFixed(2)}
        </div>
        <div className="flex items-center gap-1 text-lg">
          {renderStars(summary.overallAverage)}
        </div>
        <p className="text-xs font-mono uppercase tracking-[0.24em] text-muted-foreground">
          Based on {summary.approvedCount.toLocaleString("en-US")} reviews
        </p>
        {summary.recommendationPercentage !== null ? (
          <p className="text-sm text-foreground">
            Would recommend:{" "}
            <span className="font-mono text-foreground">
              {summary.recommendationPercentage}%
            </span>
          </p>
        ) : null}
        {summary.confidenceAdjusted !== null ? (
          <p className="text-sm text-muted-foreground">
            Confidence-adjusted score:{" "}
            <span className="font-mono text-foreground">
              {summary.confidenceAdjusted.toFixed(2)}
            </span>
          </p>
        ) : null}
      </div>

      {visibleSubscores.length > 0 ? (
        <div className="space-y-3">
          {visibleSubscores.map((subscore) => (
            <div
              className="grid grid-cols-[8rem_minmax(0,1fr)_3.5rem] items-center gap-3"
              key={subscore.key}
            >
              <span className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                {subscore.label}
              </span>
              <div className="h-2 rounded-full bg-secondary">
                <div
                  className="h-2 rounded-full bg-muted"
                  style={{ width: `${((subscore.average ?? 0) / 5) * 100}%` }}
                />
              </div>
              <span className="text-right font-mono text-sm text-foreground">
                {subscore.average?.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

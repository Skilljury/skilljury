import type { ReviewAggregateSummary } from "@/lib/reviews/aggregateRatings";

type RecommendationSummaryProps = {
  summary: ReviewAggregateSummary;
};

function renderStars(rating: number) {
  const rounded = Math.round(rating);

  return Array.from({ length: 5 }, (_, index) => (
    <span
      className={index < rounded ? "text-foreground" : "text-muted-foreground/35"}
      key={`star:${index}`}
    >
      {"\u2605"}
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
    <section className="rounded-[1.5rem] border border-border bg-card/75 p-6 shadow-sm">
      <div className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
        Review verdict
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-start">
        <div className="space-y-3">
          <div className="text-5xl font-semibold tracking-[-0.06em] text-foreground">
            {summary.overallAverage.toFixed(1)}
          </div>
          <div className="flex items-center gap-1 text-lg">{renderStars(summary.overallAverage)}</div>
          <p className="text-sm leading-7 text-muted-foreground">
            Based on {summary.approvedCount.toLocaleString("en-US")} approved reviews.
          </p>
          {summary.recommendationPercentage !== null ? (
            <p className="text-sm text-foreground">
              {summary.recommendationPercentage}% of reviewers would recommend this skill.
            </p>
          ) : null}
          {summary.confidenceAdjusted !== null ? (
            <p className="text-sm text-muted-foreground">
              Confidence-adjusted score {summary.confidenceAdjusted.toFixed(2)}.
            </p>
          ) : null}
        </div>

        {visibleSubscores.length > 0 ? (
          <div className="space-y-3">
            <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              Subscores
            </div>
            {visibleSubscores.map((subscore) => (
              <div
                className="grid grid-cols-[7rem_minmax(0,1fr)_3rem] items-center gap-3"
                key={subscore.key}
              >
                <span className="text-sm text-foreground/80">{subscore.label}</span>
                <div className="h-2 rounded-full bg-secondary">
                  <div
                    className="h-2 rounded-full bg-foreground/80"
                    style={{ width: `${((subscore.average ?? 0) / 5) * 100}%` }}
                  />
                </div>
                <span className="text-right text-sm text-foreground">
                  {subscore.average?.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

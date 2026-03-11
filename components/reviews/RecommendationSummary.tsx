import type { ReviewAggregateSummary } from "@/lib/reviews/aggregateRatings";

type RecommendationSummaryProps = {
  summary: ReviewAggregateSummary;
};

export function RecommendationSummary({
  summary,
}: RecommendationSummaryProps) {
  const visibleSubscores = summary.subscores.filter(
    (subscore) => subscore.count >= 5 && subscore.average !== null,
  );

  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-[1.25rem] bg-slate-50 p-4">
          <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
            Average rating
          </div>
          <div className="mt-3 font-mono text-3xl font-semibold text-slate-950">
            {summary.overallAverage ? `${summary.overallAverage.toFixed(2)}/5` : "No rating yet"}
          </div>
        </div>
        <div className="rounded-[1.25rem] bg-slate-50 p-4">
          <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
            Confidence-adjusted
          </div>
          <div className="mt-3 font-mono text-3xl font-semibold text-slate-950">
            {summary.confidenceAdjusted
              ? `${summary.confidenceAdjusted.toFixed(2)}/5`
              : "Pending"}
          </div>
        </div>
        <div className="rounded-[1.25rem] bg-slate-50 p-4">
          <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
            Would recommend
          </div>
          <div className="mt-3 font-mono text-3xl font-semibold text-slate-950">
            {summary.recommendationPercentage !== null
              ? `${summary.recommendationPercentage}%`
              : "Pending"}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
        <div>Yes: {summary.recommendationBreakdown.yes}</div>
        <div>With caveats: {summary.recommendationBreakdown.withCaveats}</div>
        <div>No: {summary.recommendationBreakdown.no}</div>
      </div>

      {visibleSubscores.length > 0 ? (
        <div className="mt-6 space-y-3">
          <h3 className="text-sm font-semibold text-slate-950">Subscores</h3>
          {visibleSubscores.map((subscore) => (
            <div key={subscore.key} className="grid grid-cols-[9rem_1fr_4rem] items-center gap-3 text-sm">
              <span className="text-slate-700">{subscore.label}</span>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-amber-400"
                  style={{ width: `${((subscore.average ?? 0) / 5) * 100}%` }}
                />
              </div>
              <span className="text-right font-mono text-slate-950">
                {subscore.average?.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

import type { ReviewAggregateSummary } from "@/lib/reviews/aggregateRatings";

type RatingDistributionProps = {
  summary: ReviewAggregateSummary;
};

export function RatingDistribution({ summary }: RatingDistributionProps) {
  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
      <h2 className="text-lg font-semibold text-slate-950">Rating distribution</h2>

      <div className="mt-5 space-y-3">
        {summary.distribution.map((entry) => (
          <div key={entry.rating} className="grid grid-cols-[3rem_1fr_3rem] items-center gap-3 text-sm">
            <span className="font-mono text-slate-950">{entry.rating}/5</span>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-slate-950"
                style={{ width: `${entry.percentage}%` }}
              />
            </div>
            <span className="text-right text-slate-600">{entry.count}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

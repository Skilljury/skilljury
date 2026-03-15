type QuickFactsProps = {
  averageRating: number | null;
  categoryLabel: string;
  installCommand: string | null;
  lastUpdatedAt: string | null;
  recommendationPercentage: number | null;
  reviewCount: number;
  skillName: string;
  sourceLabel: string;
  summary: string | null;
  supportsAgents: string;
};

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

export function QuickFacts({
  averageRating,
  categoryLabel,
  installCommand,
  lastUpdatedAt,
  recommendationPercentage,
  reviewCount,
  skillName,
  sourceLabel,
  summary,
  supportsAgents,
}: QuickFactsProps) {
  const hasSummary = Boolean(summary);
  const hasReviews = reviewCount > 0;

  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.04] p-6 shadow-md">
      <div className="text-xs uppercase tracking-[0.28em] text-zinc-500">
        Quick facts
      </div>
      <dl className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div>
          <dt className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">Skill name</dt>
          <dd className="mt-2 text-sm leading-7 text-white">{skillName}</dd>
        </div>
        {hasSummary ? (
          <div>
            <dt className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">
              What it does
            </dt>
            <dd className="mt-2 text-sm leading-7 text-zinc-300">{summary}</dd>
          </div>
        ) : null}
        <div>
          <dt className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">Agent compatibility</dt>
          <dd className="mt-2 text-sm leading-7 text-zinc-300">{supportsAgents}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">Category</dt>
          <dd className="mt-2 text-sm leading-7 text-zinc-300">{categoryLabel}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">Source</dt>
          <dd className="mt-2 text-sm leading-7 text-zinc-300">{sourceLabel}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">Install command</dt>
          <dd className="mt-2 break-all text-sm leading-7 text-zinc-300">
            {installCommand ?? "Install command not available from the source."}
          </dd>
        </div>
        {hasReviews ? (
          <div>
            <dt className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">Review count</dt>
            <dd className="mt-2 font-mono text-sm text-white">
              {reviewCount.toLocaleString("en-US")}
            </dd>
          </div>
        ) : null}
        {hasReviews ? (
          <div>
            <dt className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">Average rating</dt>
            <dd
              className={`mt-2 font-mono text-sm ${
                averageRating !== null ? "text-white" : "text-zinc-500"
              }`}
            >
              {averageRating ? `${averageRating.toFixed(2)}/5` : "No rating yet"}
            </dd>
          </div>
        ) : null}
        {hasReviews ? (
          <div>
            <dt className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">Would recommend</dt>
            <dd
              className={`mt-2 font-mono text-sm ${
                recommendationPercentage !== null ? "text-white" : "text-zinc-500"
              }`}
            >
              {recommendationPercentage !== null ? `${recommendationPercentage}%` : "Pending"}
            </dd>
          </div>
        ) : null}
        <div>
          <dt className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">Last updated</dt>
          <dd className="mt-2 text-sm leading-7 text-zinc-300">{formatDate(lastUpdatedAt)}</dd>
        </div>
      </dl>
    </section>
  );
}

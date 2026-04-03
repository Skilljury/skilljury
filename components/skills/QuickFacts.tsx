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
    <section className="rounded-[1.75rem] border border-border bg-card/80 p-6 shadow-sm">
      <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
        Quick facts
      </div>
      <dl className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div>
          <dt className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Skill name</dt>
          <dd className="mt-2 text-sm leading-7 text-foreground">{skillName}</dd>
        </div>
        {hasSummary ? (
          <div>
            <dt className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              What it does
            </dt>
            <dd className="mt-2 text-sm leading-7 text-muted-foreground">{summary}</dd>
          </div>
        ) : null}
        <div>
          <dt className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Agent compatibility</dt>
          <dd className="mt-2 text-sm leading-7 text-muted-foreground">{supportsAgents}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Category</dt>
          <dd className="mt-2 text-sm leading-7 text-muted-foreground">{categoryLabel}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Source</dt>
          <dd className="mt-2 text-sm leading-7 text-muted-foreground">{sourceLabel}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Install command</dt>
          <dd className="mt-2 break-all text-sm leading-7 text-muted-foreground">
            {installCommand ?? "Install command not available from the source."}
          </dd>
        </div>
        {hasReviews ? (
          <div>
            <dt className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Review count</dt>
            <dd className="mt-2 font-mono text-sm text-foreground">
              {reviewCount.toLocaleString("en-US")}
            </dd>
          </div>
        ) : null}
        {hasReviews ? (
          <div>
            <dt className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Average rating</dt>
            <dd
              className={`mt-2 font-mono text-sm ${
                averageRating !== null ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {averageRating ? `${averageRating.toFixed(2)}/5` : "No rating yet"}
            </dd>
          </div>
        ) : null}
        {hasReviews ? (
          <div>
            <dt className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Would recommend</dt>
            <dd
              className={`mt-2 font-mono text-sm ${
                recommendationPercentage !== null ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {recommendationPercentage !== null ? `${recommendationPercentage}%` : "Pending"}
            </dd>
          </div>
        ) : null}
        <div>
          <dt className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Last updated</dt>
          <dd className="mt-2 text-sm leading-7 text-muted-foreground">{formatDate(lastUpdatedAt)}</dd>
        </div>
      </dl>
    </section>
  );
}

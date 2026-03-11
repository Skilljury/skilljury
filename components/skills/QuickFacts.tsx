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
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
      <div className="text-xs uppercase tracking-[0.28em] text-slate-500">
        Quick facts
      </div>
      <dl className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div>
          <dt className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Skill name</dt>
          <dd className="mt-2 text-sm leading-7 text-slate-950">{skillName}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-[0.24em] text-slate-400">What it does</dt>
          <dd className="mt-2 text-sm leading-7 text-slate-950">
            {summary ?? "A short imported summary is not available yet."}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Agent compatibility</dt>
          <dd className="mt-2 text-sm leading-7 text-slate-950">{supportsAgents}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Category</dt>
          <dd className="mt-2 text-sm leading-7 text-slate-950">{categoryLabel}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Source</dt>
          <dd className="mt-2 text-sm leading-7 text-slate-950">{sourceLabel}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Install command</dt>
          <dd className="mt-2 break-all text-sm leading-7 text-slate-950">
            {installCommand ?? "Install command not available from the source."}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Review count</dt>
          <dd className="mt-2 font-mono text-sm text-slate-950">
            {reviewCount.toLocaleString("en-US")}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Average rating</dt>
          <dd className="mt-2 font-mono text-sm text-slate-950">
            {averageRating ? `${averageRating.toFixed(2)}/5` : "No rating yet"}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Would recommend</dt>
          <dd className="mt-2 font-mono text-sm text-slate-950">
            {recommendationPercentage !== null ? `${recommendationPercentage}%` : "Pending"}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Last updated</dt>
          <dd className="mt-2 text-sm leading-7 text-slate-950">{formatDate(lastUpdatedAt)}</dd>
        </div>
      </dl>
    </section>
  );
}

export function SkillEmptyReviewState() {
  return (
    <section className="rounded-xl border border-dashed border-white/15 bg-white/[0.04] p-6">
      <div className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">
        Review layer pending
      </div>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
        Community verdicts start in Phase 3.
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-300">
        Phase 1 focuses on live catalog integrity: skill imports, repository
        enrichment, agent distribution data, and SEO-ready entity pages. Reviews,
        ratings, and moderation open in the next implementation phase.
      </p>
    </section>
  );
}

export function SkillEmptyReviewState() {
  return (
    <section className="rounded-[1.75rem] border border-dashed border-border bg-card/45 p-6">
      <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
        Review layer pending
      </div>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
        Community verdicts start in Phase 3.
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
        Phase 1 focuses on live catalog integrity: skill imports, repository
        enrichment, agent distribution data, and SEO-ready entity pages. Reviews,
        ratings, and moderation open in the next implementation phase.
      </p>
    </section>
  );
}

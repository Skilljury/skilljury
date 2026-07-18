import Link from "next/link";

type UnavailableSnapshotRecordProps = {
  kind: "skill" | "source";
  requestedLabel: string;
};

export function UnavailableSnapshotRecord({
  kind,
  requestedLabel,
}: UnavailableSnapshotRecordProps) {
  const title = kind === "skill" ? "Skill temporarily unavailable" : "Source temporarily unavailable";

  return (
    <section
      className="rounded-[2rem] border border-border bg-card/80 p-7 shadow-sm sm:p-10"
      data-recovery-unavailable={kind}
    >
      <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-amber-200">
        Recovery snapshot
      </div>
      <h1 className="font-display mt-6 text-balance text-4xl tracking-[-0.04em] text-foreground sm:text-6xl">
        {title}
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
        <span className="font-medium text-foreground">{requestedLabel}</span> is not included in the verified emergency snapshot currently serving SkillJury. The full catalog will return when live provider access is restored.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          className="inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-default hover:bg-primary/90"
          href="/search"
        >
          Search visible skills
        </Link>
        <Link
          className="inline-flex rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground transition-default hover:bg-surface-hover"
          href="/"
        >
          Back to catalog
        </Link>
      </div>
    </section>
  );
}

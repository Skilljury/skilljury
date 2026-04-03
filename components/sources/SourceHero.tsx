import type { BrowseSource } from "@/lib/db/sourcePages";

type SourceHeroProps = {
  source: BrowseSource;
};

export function SourceHero({ source }: SourceHeroProps) {
  return (
    <section className="rounded-[2rem] border border-border bg-card/80 p-7 shadow-sm">
      <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
        Source repository
      </div>
      <h1 className="mt-4 break-all font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        {source.name}
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground">
        {source.attributionText ??
          "These skills were imported into SkillJury from the public skills ecosystem."}
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span className="rounded-full border border-border bg-background px-4 py-2 text-foreground">
          {(source.skillCount ?? 0).toLocaleString("en-US")} linked skills
        </span>
        {source.homepageUrl ? (
          <a
            className="rounded-full border border-border bg-background px-4 py-2 text-foreground underline decoration-border underline-offset-4 transition hover:border-primary/20 hover:bg-card"
            href={source.homepageUrl}
            rel="noreferrer"
            target="_blank"
          >
            Visit source
          </a>
        ) : null}
      </div>
    </section>
  );
}

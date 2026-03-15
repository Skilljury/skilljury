import type { BrowseSource } from "@/lib/db/sourcePages";

type SourceHeroProps = {
  source: BrowseSource;
};

export function SourceHero({ source }: SourceHeroProps) {
  return (
    <section className="rounded-xl border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,22,0.96),rgba(10,10,12,0.92))] p-7 shadow-lg">
      <div className="text-xs uppercase tracking-[0.28em] text-zinc-500">
        Source repository
      </div>
      <h1 className="mt-4 break-all font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
        {source.name}
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-8 text-zinc-400">
        {source.attributionText ??
          "These skills were imported into SkillJury from the public skills ecosystem."}
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-zinc-300">
        <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2">
          {(source.skillCount ?? 0).toLocaleString("en-US")} linked skills
        </span>
        {source.homepageUrl ? (
          <a
            className="rounded-full border border-white/10 px-4 py-2 underline decoration-white/20 underline-offset-4"
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

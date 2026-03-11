import type { BrowseSource } from "@/lib/db/sourcePages";

type SourceHeroProps = {
  source: BrowseSource;
};

export function SourceHero({ source }: SourceHeroProps) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_25px_70px_rgba(15,23,42,0.08)]">
      <div className="text-xs uppercase tracking-[0.28em] text-slate-500">
        Source repository
      </div>
      <h1 className="mt-4 break-all font-display text-4xl tracking-tight text-slate-950 sm:text-5xl">
        {source.name}
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
        {source.attributionText ??
          "These skills were imported into SkillJury from the public skills ecosystem."}
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-700">
        <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
          {(source.skillCount ?? 0).toLocaleString("en-US")} linked skills
        </span>
        {source.homepageUrl ? (
          <a
            className="rounded-full border border-slate-200 bg-white px-4 py-2 underline decoration-slate-300 underline-offset-4"
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

import type { BrowseCategory } from "@/lib/db/categories";
import Link from "next/link";

type CategoryHeroProps = {
  category: BrowseCategory;
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

export function CategoryHero({ category }: CategoryHeroProps) {
  return (
    <section className="rounded-xl border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,22,0.96),rgba(10,10,12,0.92))] p-7 shadow-lg">
      <div className="text-xs uppercase tracking-[0.28em] text-zinc-500">
        Category
      </div>
      <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight text-white">
        Best {category.name} skills for AI agents
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-8 text-zinc-400">
        {category.description ??
          "Catalog view generated from the public skill dataset and SkillJury's starter taxonomy rules."}
      </p>
      {category.reviewedSkillCount > 0 ? (
        <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-300">
          The best {category.name} skills for AI agents, ranked by user reviews.{" "}
          {category.reviewedSkillCount.toLocaleString("en-US")} skills reviewed.
        </p>
      ) : null}
      <div className="mt-6 inline-flex rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-zinc-200">
        {category.skillCount.toLocaleString("en-US")} skills in this category
      </div>
      <div className="mt-4 text-sm text-zinc-500">
        Last updated: {formatDate(category.lastUpdatedAt)}
      </div>

      {category.topPicks.length > 0 ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {category.topPicks.map((skill) => (
            <Link
              key={skill.id}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-4 text-sm shadow-md transition hover:border-white/20"
              href={`/skills/${skill.slug}`}
            >
              <div className="font-semibold text-white">{skill.name}</div>
              <p className="mt-2 line-clamp-3 leading-7 text-zinc-400">
                {skill.shortSummary ?? "No imported summary yet."}
              </p>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}

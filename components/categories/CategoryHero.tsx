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
    <section className="rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.14),transparent_30%),linear-gradient(135deg,#ffffff,#f8f5ef)] p-7 shadow-[0_25px_70px_rgba(15,23,42,0.08)]">
      <div className="text-xs uppercase tracking-[0.28em] text-slate-500">
        Category
      </div>
      <h1 className="mt-4 font-display text-5xl tracking-tight text-slate-950">
        Best {category.name} skills for AI agents
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
        {category.description ??
          "Catalog view generated from the public skill dataset and SkillJury's starter taxonomy rules."}
      </p>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-700">
        The best {category.name} skills for AI agents, ranked by user reviews.{" "}
        {category.reviewedSkillCount.toLocaleString("en-US")} skills reviewed.
      </p>
      <div className="mt-6 inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">
        {category.skillCount.toLocaleString("en-US")} skills in this category
      </div>
      <div className="mt-4 text-sm text-slate-600">
        Last updated: {formatDate(category.lastUpdatedAt)}
      </div>

      {category.topPicks.length > 0 ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {category.topPicks.map((skill) => (
            <Link
              key={skill.id}
              className="rounded-[1.25rem] border border-slate-200 bg-white px-4 py-4 text-sm shadow-[0_15px_35px_rgba(15,23,42,0.06)] transition hover:border-slate-300"
              href={`/skills/${skill.slug}`}
            >
              <div className="font-semibold text-slate-950">{skill.name}</div>
              <p className="mt-2 line-clamp-3 leading-7 text-slate-600">
                {skill.shortSummary ?? "No imported summary yet."}
              </p>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}

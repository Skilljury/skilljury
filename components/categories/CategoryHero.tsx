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
    <section className="rounded-[2rem] border border-border bg-card/80 p-7 shadow-sm">
      <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
        Category
      </div>
      <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight text-foreground">
        Best {category.name} skills for AI agents
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground">
        {category.description ??
          "Catalog view generated from the public skill dataset and SkillJury's starter taxonomy rules."}
      </p>
      {category.reviewedSkillCount > 0 ? (
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
          The best {category.name} skills for AI agents, ranked by user reviews.{" "}
          {category.reviewedSkillCount.toLocaleString("en-US")} skills reviewed.
        </p>
      ) : null}
      <div className="mt-6 inline-flex rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground">
        {category.skillCount.toLocaleString("en-US")} skills in this category
      </div>
      <div className="mt-4 text-sm text-muted-foreground">
        Last updated: {formatDate(category.lastUpdatedAt)}
      </div>

      {category.topPicks.length > 0 ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {category.topPicks.map((skill) => (
            <Link
              key={skill.id}
              className="rounded-[1.5rem] border border-border bg-background/70 px-4 py-4 text-sm shadow-sm transition hover:border-primary/20 hover:bg-card"
              href={`/skills/${skill.slug}`}
            >
              <div className="font-semibold text-foreground">{skill.name}</div>
              <p className="mt-2 line-clamp-3 leading-7 text-muted-foreground">
                {skill.shortSummary ?? "No imported summary yet."}
              </p>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}

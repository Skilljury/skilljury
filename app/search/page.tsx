import type { Metadata } from "next";
import Link from "next/link";

import {
  EMERGENCY_CATALOG_SNAPSHOT_AT,
  EMERGENCY_LEADERBOARD,
} from "@/lib/data/emergencyCatalog";
import { buildPageMetadata } from "@/lib/seo/metadata";

 type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type SearchPageProps = {
  searchParams: SearchParams;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const resolved = await searchParams;
  const query = firstParam(resolved.q).trim();

  return buildPageMetadata({
    title: query ? `${query} AI skills | SkillJury` : "Search AI agent skills | SkillJury",
    description:
      "Search SkillJury's verified recovery snapshot of popular AI agent skills and security signals.",
    indexable: query.length >= 2,
    pathname: query ? `/search?q=${encodeURIComponent(query)}` : "/search",
  });
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolved = await searchParams;
  const query = firstParam(resolved.q).trim();
  const normalizedQuery = query.toLocaleLowerCase("en-US");
  const results = EMERGENCY_LEADERBOARD.filter((skill) => {
    if (!normalizedQuery) {
      return true;
    }

    return [skill.name, skill.slug, skill.source.name, skill.source.slug].some((value) =>
      value.toLocaleLowerCase("en-US").includes(normalizedQuery),
    );
  });
  const snapshotDate = new Date(EMERGENCY_CATALOG_SNAPSHOT_AT).toLocaleString(
    "en-US",
    { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" },
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <section className="space-y-4">
        <div className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
          Search
        </div>
        <h1 className="text-balance text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
          Search the verified recovery snapshot
        </h1>
        <p className="max-w-3xl text-base leading-8 text-muted-foreground">
          Live Supabase search is temporarily unavailable. These results come from a direct PostgreSQL snapshot captured {snapshotDate}.
        </p>
      </section>

      <form action="/search" className="rounded-2xl border border-border bg-card/80 p-3" method="get">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="snapshot-search">
            Search skills
          </label>
          <input
            className="h-12 min-w-0 flex-1 rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            defaultValue={query}
            id="snapshot-search"
            name="q"
            placeholder="Try Flutter, SEO, testing, or a source name"
            type="search"
          />
          <button
            className="h-12 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground hover:opacity-95"
            type="submit"
          >
            Search
          </button>
        </div>
      </form>

      <section className="space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
              Snapshot results
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {results.length.toLocaleString("en-US")} visible result{results.length === 1 ? "" : "s"}
              {query ? <> for <span className="font-mono text-foreground">{query}</span></> : null}
            </p>
          </div>
          <Link className="text-sm text-primary hover:underline" href="/">
            Back to recovery homepage
          </Link>
        </div>

        {results.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-border bg-card/80">
            {results.map((skill) => (
              <Link
                className="grid gap-2 border-b border-border/60 px-5 py-5 last:border-0 hover:bg-surface-hover sm:grid-cols-[minmax(0,1fr)_120px] sm:items-center"
                href={`/skills/${skill.slug}`}
                key={skill.id}
              >
                <span className="min-w-0">
                  <span className="block truncate text-base font-medium text-foreground">
                    {skill.name}
                  </span>
                  <span className="mt-1 block truncate text-sm text-muted-foreground">
                    {skill.source.name}
                  </span>
                </span>
                <span className="text-sm text-muted-foreground sm:text-right">
                  {skill.weeklyInstalls.toLocaleString("en-US")}/week
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card/70 p-8 text-sm leading-7 text-muted-foreground">
            No match is present in the 25-skill emergency snapshot. The full 4,274-skill catalog will return when Supabase lifts the provider restriction.
          </div>
        )}
      </section>
    </div>
  );
}

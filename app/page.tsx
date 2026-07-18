import Link from "next/link";

import {
  EMERGENCY_AGENT_RAIL,
  EMERGENCY_CATEGORIES,
  EMERGENCY_CATALOG_SNAPSHOT_AT,
  EMERGENCY_LEADERBOARD,
  EMERGENCY_SKILL_COUNT,
  EMERGENCY_SOURCE_COUNT,
} from "@/lib/data/emergencyCatalog";

export default function Home() {
  const snapshotDate = new Date(EMERGENCY_CATALOG_SNAPSHOT_AT).toLocaleString(
    "en-US",
    { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" },
  );

  return (
    <div className="w-full space-y-14">
      <section className="grid gap-8 pb-4 pt-2 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)] lg:items-end">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-amber-200">
            <span className="h-2 w-2 rounded-full bg-amber-300" />
            Verified snapshot mode
          </div>

          <h1 className="font-display max-w-3xl text-balance text-[clamp(2.15rem,9vw,4.8rem)] leading-[0.94] tracking-[-0.05em] text-foreground">
            Find AI agent skills worth installing — with rankings and security signals.
          </h1>

          <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
            Browse a verified recovery snapshot of {EMERGENCY_SKILL_COUNT.toLocaleString("en-US")} skills from {EMERGENCY_SOURCE_COUNT.toLocaleString("en-US")} sources while live catalog sync is temporarily unavailable.
          </p>

          <form action="/search" className="max-w-2xl" method="get">
            <div className="search-glow flex flex-col gap-2 rounded-2xl border border-border/80 bg-card/80 p-2 sm:flex-row sm:items-center">
              <label className="sr-only" htmlFor="homepage-search">
                Search the recovery catalog
              </label>
              <input
                className="h-12 min-w-0 flex-1 bg-transparent px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                id="homepage-search"
                name="q"
                placeholder="Search the verified snapshot"
                type="search"
              />
              <button
                className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground hover:opacity-95 sm:m-1.5 sm:h-auto sm:py-2"
                type="submit"
              >
                Search
              </button>
            </div>
          </form>

          <div className="grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric label="Skills" value={EMERGENCY_SKILL_COUNT} />
            <Metric label="Sources" value={EMERGENCY_SOURCE_COUNT} />
            <Metric label="Agents" value={29} />
            <Metric label="Visible now" value={EMERGENCY_LEADERBOARD.length} />
          </div>
        </div>

        <aside className="rounded-3xl border border-border/80 bg-card/70 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
          <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            Recovery status
          </div>
          <p className="mt-4 text-sm font-medium text-foreground">
            The database is intact. Supabase API access is temporarily restricted.
          </p>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            This read-only snapshot was generated directly from PostgreSQL on {snapshotDate}. Reviews, sign-in, submissions, and live sync may remain unavailable until the provider restriction is lifted.
          </p>
        </aside>
      </section>

      <section className="border-t border-border/70 pt-12" id="agents">
        <p className="text-sm text-muted-foreground">Browse by agent</p>
        <h2 className="font-display mt-3 text-3xl tracking-[-0.04em] text-foreground sm:text-4xl">
          Popular AI coding environments
        </h2>
        <div className="mt-7 flex flex-wrap gap-3">
          {EMERGENCY_AGENT_RAIL.map((agent) => (
            <Link
              className="rounded-full border border-border/70 bg-card/60 px-4 py-2 text-sm text-muted-foreground hover:border-primary/30 hover:text-foreground"
              href={`/agents/${agent.slug}`}
              key={agent.id}
            >
              {agent.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-border/70 pt-12" id="categories">
        <p className="text-sm text-muted-foreground">Browse by category</p>
        <h2 className="font-display mt-3 text-3xl tracking-[-0.04em] text-foreground sm:text-4xl">
          Compare skills by job to be done
        </h2>
        <div className="mt-7 flex flex-wrap gap-3">
          {EMERGENCY_CATEGORIES.map((category) => (
            <Link
              className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-4 py-2 text-sm text-muted-foreground hover:border-primary/30 hover:text-foreground"
              href={`/categories/${category.slug}`}
              key={category.id}
            >
              <span>{category.name}</span>
              <span className="text-xs">{category.skillCount.toLocaleString("en-US")}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-border/70 pt-12" id="leaderboard">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Verified leaderboard snapshot</p>
            <h2 className="font-display mt-3 text-3xl tracking-[-0.04em] text-foreground sm:text-4xl">
              Most-installed skills in the recovery catalog
            </h2>
          </div>
          <Link className="text-sm text-primary hover:underline" href="/search">
            Search snapshot
          </Link>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card/80">
          {EMERGENCY_LEADERBOARD.map((skill, index) => (
            <Link
              className="grid grid-cols-[48px_minmax(0,1fr)_90px] items-center gap-3 border-b border-border/60 px-4 py-4 last:border-0 hover:bg-surface-hover sm:grid-cols-[64px_minmax(0,1fr)_120px] sm:px-6"
              href={`/skills/${skill.slug}`}
              key={skill.id}
            >
              <span className="text-sm text-muted-foreground">#{index + 1}</span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-foreground">{skill.name}</span>
                <span className="block truncate text-xs text-muted-foreground">{skill.source.name}</span>
              </span>
              <span className="text-right text-sm text-foreground">{skill.weeklyInstalls}/wk</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/60 px-4 py-3">
      <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className="mt-2 text-sm text-foreground">{value.toLocaleString("en-US")}</div>
    </div>
  );
}

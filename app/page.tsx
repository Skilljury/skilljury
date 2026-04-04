import Link from "next/link";

import { AgentRail } from "@/components/home/AgentRail";
import { SkillsLeaderboard } from "@/components/home/SkillsLeaderboard";
import { JsonLd } from "@/components/seo/JsonLd";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { getAgentRailAgents } from "@/lib/db/agents";
import { getAllCategories } from "@/lib/db/categories";
import { getLeaderboardSkills } from "@/lib/db/skills";
import { getSourceCount } from "@/lib/db/sources";
import { buildCanonicalUrl } from "@/lib/seo/metadata";
import {
  buildFaqJsonLd,
  buildItemListJsonLd,
  buildOrganizationJsonLd,
  buildWebsiteJsonLd,
} from "@/lib/seo/schema";

export default async function Home() {
  const [
    allTimeLeaderboard,
    trendingLeaderboard,
    hotLeaderboard,
    liveSourceCount,
    agents,
    categories,
  ] = await Promise.all([
    getLeaderboardSkills("all", 1, 25),
    getLeaderboardSkills("trending", 1, 1),
    getLeaderboardSkills("hot", 1, 1),
    getSourceCount(),
    getAgentRailAgents(),
    getAllCategories(),
  ]);

  const liveSkillCount = allTimeLeaderboard.total;
  const homepageFaqs = [
    {
      question: "What is SkillJury?",
      answer:
        "SkillJury is the public review layer for AI agent skills, combining live catalog data with review slots, source pages, compatibility context, and security-audit signals.",
    },
    {
      question: "What do the leaderboard tabs mean?",
      answer:
        "All Time ranks skills by current weekly install volume, Trending favors recently synced skills with install momentum, and Hot surfaces the newest active entries in the catalog.",
    },
    {
      question: "Are leaderboard rankings the same as public reviews?",
      answer:
        "No. Install counts and source metadata help developers shortlist skills, but community reviews remain separate so operational telemetry never pretends to be a verdict.",
    },
    {
      question: "Can I browse beyond the homepage?",
      answer:
        "Yes. SkillJury has dedicated pages for individual skills, agents, categories, sources, and public review archives so developers can go from discovery into deeper evaluation.",
    },
  ];
  const leaderboardItems = allTimeLeaderboard.items.map((skill) => ({
    name: skill.name,
    url: buildCanonicalUrl(`/skills/${skill.slug}`),
  }));
  const tabTotals = {
    all: allTimeLeaderboard.total,
    trending: trendingLeaderboard.total,
    hot: hotLeaderboard.total,
  } as const;

  return (
    <div className="w-full space-y-16">
      <JsonLd
        data={buildOrganizationJsonLd({
          liveSkillCount,
          liveSourceCount,
          agentCount: agents.length,
        })}
      />
      <JsonLd data={buildWebsiteJsonLd()} />
      <JsonLd data={buildFaqJsonLd(homepageFaqs)} />
      {leaderboardItems.length > 0 ? (
        <JsonLd
          data={buildItemListJsonLd({
            canonicalPath: "/",
            itemName: "Top AI agent skills on SkillJury",
            items: leaderboardItems,
          })}
        />
      ) : null}

      <ScrollReveal>
        <section className="grid gap-8 pb-4 pt-2 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)] lg:items-end">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              <span className="pulse-dot" />
              Signal Index
            </div>

            <h1 className="font-display max-w-3xl text-balance text-[clamp(2.15rem,9vw,4.8rem)] leading-[0.94] tracking-[-0.05em] text-foreground">
              Find AI skills worth installing.
            </h1>

            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              {liveSkillCount.toLocaleString("en-US")} skills with public reviews,
              install context, and source data across {agents.length} agents and{" "}
              {liveSourceCount.toLocaleString("en-US")} sources.
            </p>

            <form action="/search" className="max-w-2xl" method="get">
              <div className="search-glow flex flex-col gap-2 rounded-2xl border border-border/80 bg-card/80 p-2 transition-all duration-200 focus-within:border-primary/30 sm:flex-row sm:items-center">
                <label className="sr-only" htmlFor="homepage-search">
                  Search the skill catalog
                </label>
                <input
                  className="h-12 min-w-0 flex-1 bg-transparent px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  defaultValue=""
                  id="homepage-search"
                  name="q"
                  placeholder="Search skills or sources"
                  type="search"
                />
                <button
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-95 sm:m-1.5 sm:h-auto sm:py-2"
                  type="submit"
                >
                  Search
                </button>
              </div>
            </form>

            <div className="grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-border/70 bg-card/60 px-4 py-3">
                <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  Skills
                </div>
                <div className="mt-2 text-sm text-foreground">
                  {liveSkillCount.toLocaleString("en-US")}
                </div>
              </div>
              <div className="rounded-2xl border border-border/70 bg-card/60 px-4 py-3">
                <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  Sources
                </div>
                <div className="mt-2 text-sm text-foreground">
                  {liveSourceCount.toLocaleString("en-US")}
                </div>
              </div>
              <div className="rounded-2xl border border-border/70 bg-card/60 px-4 py-3">
                <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  Agents
                </div>
                <div className="mt-2 text-sm text-foreground">{agents.length}</div>
              </div>
              <div className="rounded-2xl border border-border/70 bg-card/60 px-4 py-3">
                <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  Live rankings
                </div>
                <div className="mt-2 text-sm text-foreground">
                  {allTimeLeaderboard.total.toLocaleString("en-US")}
                </div>
              </div>
            </div>
          </div>

          <aside className="rounded-3xl border border-border/80 bg-card/70 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
            <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              What this index shows
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Public verdicts stay separate from source facts.
                </p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  SkillJury keeps reviews, installs, compatibility, and repository signals visible instead of collapsing them into one score.
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Browse from a short list into the full record.
                </p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Search is the primary action, but agents, categories, and rankings are always one click away.
                </p>
              </div>
            </div>
          </aside>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={60}>
        <section className="border-t border-border/70 pt-12 sm:pt-14" id="agents">
          <div className="max-w-2xl space-y-3">
            <p className="text-sm text-muted-foreground">Browse by agent</p>
            <h2 className="font-display text-3xl tracking-[-0.04em] text-foreground sm:text-4xl">
              Start where people already work.
            </h2>
            <p className="text-sm leading-7 text-muted-foreground">
              The index should feel familiar to builders scanning the environments they already use.
            </p>
          </div>
          <div className="mt-8">
            <AgentRail agents={agents} />
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={100}>
        <section className="border-t border-border/70 pt-12 sm:pt-14" id="categories">
          <div className="max-w-2xl space-y-3">
            <p className="text-sm text-muted-foreground">Browse by category</p>
            <h2 className="font-display text-3xl tracking-[-0.04em] text-foreground sm:text-4xl">
              Compare skills by job to be done.
            </h2>
            <p className="text-sm leading-7 text-muted-foreground">
              Categories should compress the field quickly without hiding the underlying signal.
            </p>
          </div>
          <div className="scrollbar-hide mt-8 overflow-x-auto pb-2">
            <div className="flex min-w-max gap-3">
              {categories
                .filter((category) => category.skillCount > 0)
                .map((category) => (
                  <Link
                    className="transition-default inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-4 py-2 text-sm text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    href={`/categories/${category.slug}`}
                    key={category.id}
                  >
                    <span>{category.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {category.skillCount.toLocaleString("en-US")}
                    </span>
                  </Link>
                ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={140}>
        <section className="border-t border-border/70 pt-12 sm:pt-14" id="leaderboard">
          <SkillsLeaderboard initialData={allTimeLeaderboard} tabTotals={tabTotals} />
        </section>
      </ScrollReveal>

      <ScrollReveal delay={160}>
        <section className="border-t border-border/70 pt-12 sm:pt-14" id="about">
          <div className="max-w-2xl space-y-3">
            <p className="text-sm text-muted-foreground">About</p>
            <h2 className="font-display text-3xl tracking-[-0.04em] text-foreground sm:text-4xl">
              About SkillJury
            </h2>
          </div>
          <div className="mt-6 max-w-3xl space-y-4 text-sm leading-7 text-muted-foreground">
            <p>
              SkillJury indexes {liveSkillCount.toLocaleString("en-US")} skills
              from {liveSourceCount.toLocaleString("en-US")} sources across{" "}
              {agents.length} AI agents including Claude Code, Cursor, Windsurf,
              Codex, and Cline. Each listing includes security audit signals from
              Socket.dev and Snyk.
            </p>
            <p>
              Community reviews are separated from catalog signals like weekly
              installs, GitHub stars, and source metadata. This makes it possible
              to shortlist skills by operational data while evaluating them
              through independent reviews.
            </p>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={180}>
        <section className="border-t border-border/70 pt-12 sm:pt-14" id="faq">
          <div className="max-w-2xl space-y-3">
            <p className="text-sm text-muted-foreground">FAQ</p>
            <h2 className="font-display text-3xl tracking-[-0.04em] text-foreground sm:text-4xl">
              Questions developers ask first.
            </h2>
          </div>

          <div className="mt-8 max-w-3xl space-y-3">
            {homepageFaqs.map((item) => (
              <details
                className="group rounded-2xl border border-border/70 bg-card/60 px-5 py-4 transition-all duration-200 open:border-primary/25 open:bg-surface-hover"
                key={item.question}
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm text-foreground [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <svg
                    className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}

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
    <div className="w-full space-y-10">
      <JsonLd
        data={buildOrganizationJsonLd({
          liveSkillCount,
          liveSourceCount,
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

      <ScrollReveal className="hero-glow">
        <section className="relative overflow-hidden rounded-xl border border-border bg-card/85 p-8 sm:p-10">
          <div className="relative z-10 space-y-8">
            <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.34em] text-muted-foreground">
              <span>Live catalog</span>
              <span className="text-zinc-700">/</span>
              <span>{liveSkillCount.toLocaleString("en-US")} skills</span>
              <span className="text-zinc-700">/</span>
              <span>{liveSourceCount.toLocaleString("en-US")} sources</span>
              <span className="text-zinc-700">/</span>
              <span>{agents.length.toLocaleString("en-US")} agents</span>
            </div>

            <div className="space-y-4">
              <h1 className="gradient-wordmark text-balance text-[clamp(2.5rem,10vw,6rem)] font-semibold uppercase leading-[0.86] tracking-[0.18em]">
                SkillJury
              </h1>
              <p className="max-w-3xl text-balance text-lg leading-8 text-zinc-300 sm:text-xl">
                The public review layer for AI agent skills. Real ratings from real
                developers.
              </p>
            </div>

            <form
              action="/search"
              className="search-glow max-w-3xl rounded-xl border border-border bg-surface-elevated/90 p-2 transition-default"
              method="get"
            >
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="sr-only" htmlFor="homepage-search">
                  Search the skill catalog
                </label>
                <input
                  className="h-14 flex-1 bg-transparent px-4 text-sm text-foreground placeholder:text-muted-foreground"
                  defaultValue=""
                  id="homepage-search"
                  name="q"
                  placeholder="Try it now: search skills, agents, sources, or install flows"
                  type="search"
                />
                <button
                  className="inline-flex h-14 items-center justify-center rounded-lg border border-border bg-primary px-5 text-[11px] uppercase tracking-[0.34em] text-primary-foreground transition-default hover:opacity-90"
                  type="submit"
                >
                  Search
                </button>
              </div>
            </form>

            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
              Use install counts, source pages, and security audit indicators to
              narrow the field quickly, then move into skill pages as first-party
              reviews accumulate.
            </p>
          </div>
        </section>
      </ScrollReveal>

      <div className="gradient-line" />

      <ScrollReveal className="space-y-4" delay={80}>
        <section className="space-y-4" id="agents">
          <div className="space-y-2">
            <div className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground">
              Available for these agents
            </div>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
              Browse the catalog by the agent environments developers already use in
              production workflows.
            </p>
          </div>
          <AgentRail agents={agents} />
        </section>
      </ScrollReveal>

      <ScrollReveal className="space-y-4" delay={120}>
        <section className="space-y-4" id="categories">
          <div className="gradient-line" />
          <div className="space-y-2">
            <div className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground">
              Browse by category
            </div>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
              Move from leaderboard discovery into focused slices of the catalog
              when you already know the workflow you are evaluating.
            </p>
          </div>

          <div className="scrollbar-hide overflow-x-auto pb-2">
            <div className="flex min-w-max gap-3">
              {categories
                .filter((category) => category.skillCount > 0)
                .map((category) => (
                <Link
                  className="transition-default inline-flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground hover:border-white/20 hover:bg-surface-hover hover:text-foreground"
                  href={`/categories/${category.slug}`}
                  key={category.id}
                >
                  <span>{category.name}</span>
                  <span className="text-zinc-600">
                    {category.skillCount.toLocaleString("en-US")}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      <div className="gradient-line" />

      <ScrollReveal delay={160}>
        <SkillsLeaderboard initialData={allTimeLeaderboard} tabTotals={tabTotals} />
      </ScrollReveal>

      <div className="gradient-line" />

      <ScrollReveal delay={220}>
        <section className="space-y-6" id="faq">
          <div className="space-y-2">
            <div className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground">
              FAQ
            </div>
            <h2 className="text-balance text-2xl font-semibold uppercase tracking-[0.14em] text-foreground sm:text-3xl">
              Questions developers ask first
            </h2>
          </div>

          <div className="space-y-3">
            {homepageFaqs.map((item) => (
              <details
                className="group rounded-xl border border-border bg-card/80 px-5 py-4 transition-default open:bg-surface-elevated/80"
                key={item.question}
              >
                <summary className="flex cursor-pointer items-center justify-between pr-2 text-sm uppercase tracking-[0.18em] text-foreground [&::-webkit-details-marker]:hidden">
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
                <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
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

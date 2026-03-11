import type { Metadata } from "next";

import { FilterPanel } from "@/components/search/FilterPanel";
import { SearchBar } from "@/components/search/SearchBar";
import { ResultGrid } from "@/components/search/ResultGrid";
import { PaginationNav } from "@/components/listing/PaginationNav";
import { getAllAgents } from "@/lib/db/agents";
import { getAllCategories } from "@/lib/db/categories";
import { searchSkills } from "@/lib/db/search";
import { getAllSources } from "@/lib/db/sourcePages";
import { firstParam, normalizePageParam, normalizeSortParam } from "@/lib/routing/browseParams";
import { decodeSourceSlug, encodeSourceSlug } from "@/lib/routing/sourceSlug";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildSearchMetadataText } from "@/lib/seo/titleTemplates";

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const { title, description } = buildSearchMetadataText(
    firstParam(resolvedSearchParams.q),
  );

  return buildPageMetadata({
    title,
    description,
    pathname: "/search",
  });
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const [categories, agents, sources] = await Promise.all([
    getAllCategories(),
    getAllAgents(),
    getAllSources(),
  ]);

  const query = firstParam(resolvedSearchParams.q);
  const selectedCategory = firstParam(resolvedSearchParams.category);
  const selectedAgent = firstParam(resolvedSearchParams.agent);
  const selectedSource = firstParam(resolvedSearchParams.source);
  const page = normalizePageParam(resolvedSearchParams.page);
  const sort = normalizeSortParam(resolvedSearchParams.sort);

  const category = categories.find((item) => item.slug === selectedCategory) ?? null;
  const agent = agents.find((item) => item.slug === selectedAgent) ?? null;
  const source =
    sources.find((item) => item.slug === decodeSourceSlug(selectedSource)) ?? null;

  const results = await searchSkills({
    query,
    categoryId: category?.id ?? null,
    agentId: agent?.id ?? null,
    sourceId: source?.id ?? null,
    page,
    sort,
  });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 lg:px-10 lg:py-14">
      <section className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(247,212,138,0.18),transparent_35%),linear-gradient(135deg,#0f172a,#050816_65%)] px-6 py-8 text-white shadow-[0_45px_120px_rgba(0,0,0,0.45)] lg:px-10">
        <div className="text-xs uppercase tracking-[0.28em] text-slate-400">
          Search and filters
        </div>
        <h1 className="mt-4 font-display text-5xl tracking-tight sm:text-6xl">
          Search the live skill catalog.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
          Query by skill name, then narrow the results by category, agent, or
          source repository. The results below come directly from the hosted
          Supabase catalog.
        </p>
      </section>

      <form action="/search" className="space-y-5" method="get">
        <SearchBar defaultValue={query} />
        <FilterPanel
          agents={agents.map((item) => ({ name: item.name, slug: item.slug }))}
          categories={categories.map((item) => ({
            name: item.name,
            slug: item.slug,
          }))}
          selectedAgent={selectedAgent}
          selectedCategory={selectedCategory}
          selectedSource={selectedSource}
          sort={sort}
          sources={sources.map((item) => ({
            name: item.name,
            slug: encodeSourceSlug(item.slug),
          }))}
        />
      </form>

      <section className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.28em] text-slate-500">
              Results
            </div>
            <h2 className="mt-3 font-display text-4xl tracking-tight text-slate-950">
              {results.totalCount.toLocaleString("en-US")} matching skills
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            Sort order is stable across pagination. Search is database-backed and
            falls back to live catalog popularity when multiple entries match.
          </p>
        </div>

        <ResultGrid items={results.items} />

        <PaginationNav
          basePath="/search"
          page={results.page}
          query={{
            agent: selectedAgent || undefined,
            category: selectedCategory || undefined,
            q: query || undefined,
            sort,
            source: selectedSource || undefined,
          }}
          totalPages={results.totalPages}
        />
      </section>
    </div>
  );
}

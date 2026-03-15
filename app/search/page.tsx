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
    indexable: false,
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
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <section className="space-y-4">
        <div className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground">
          Search
        </div>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Search the live skill catalog
        </h1>
        <p className="max-w-3xl text-lg leading-8 text-foreground/80">
          Search by skill name, then narrow the registry by category, agent, or
          source repository.
        </p>
      </section>

      <form
        action="/search"
        className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]"
        method="get"
      >
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
        <SearchBar defaultValue={query} />
      </form>

      <section className="space-y-5">
        <div className="flex flex-col gap-2">
          <div className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground">
            Results
          </div>
          <p className="text-sm text-muted-foreground">
            {results.totalCount.toLocaleString("en-US")} results
            {query ? (
              <>
                {" "}
                for <span className="font-mono text-foreground">{query}</span>
              </>
            ) : null}
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

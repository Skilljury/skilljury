import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { SortSelect } from "@/components/listing/SortSelect";
import { PaginationNav } from "@/components/listing/PaginationNav";
import { JsonLd } from "@/components/seo/JsonLd";
import { ResultGrid } from "@/components/search/ResultGrid";
import { SourceHero } from "@/components/sources/SourceHero";
import { searchSkills } from "@/lib/db/search";
import { getSourceBySlug } from "@/lib/db/sourcePages";
import { normalizePageParam, normalizeSortParam } from "@/lib/routing/browseParams";
import { decodeSourceSlug, encodeSourceSlug } from "@/lib/routing/sourceSlug";
import { buildCanonicalUrl, buildPageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbJsonLd, buildItemListJsonLd } from "@/lib/seo/schema";
import { buildSourceMetadataText } from "@/lib/seo/titleTemplates";

type Params = Promise<{ sourceSlug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type SourcePageProps = {
  params: Params;
  searchParams: SearchParams;
};

export async function generateMetadata({
  params,
}: SourcePageProps): Promise<Metadata> {
  const { sourceSlug } = await params;
  const decodedSlug = decodeSourceSlug(sourceSlug);
  const source = await getSourceBySlug(decodedSlug);

  if (!source) {
    return buildPageMetadata({
      title: "Source not found | SkillJury",
      description: "The requested source page could not be found in the live catalog.",
      pathname: `/sources/${sourceSlug}`,
    });
  }

  const { title, description } = buildSourceMetadataText(source.name);
  return buildPageMetadata({
    title,
    description,
    indexable: (source.skillCount ?? 0) > 3,
    pathname: `/sources/${encodeSourceSlug(source.slug)}`,
  });
}

function SourcePageSkeleton() {
  return (
    <>
      <div className="h-48 animate-pulse rounded-[2rem] bg-muted/30" />
      <div className="h-96 animate-pulse rounded-[1.5rem] bg-muted/30" />
    </>
  );
}

async function SourcePageContent({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const [{ sourceSlug }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const decodedSlug = decodeSourceSlug(sourceSlug);
  const source = await getSourceBySlug(decodedSlug);

  if (!source) {
    notFound();
  }

  const page = normalizePageParam(resolvedSearchParams.page);
  const sort = normalizeSortParam(resolvedSearchParams.sort);
  const results = await searchSkills({
    sourceId: source.id,
    page,
    sort,
  });
  const canonicalPath = `/sources/${encodeSourceSlug(source.slug)}`;
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: source.name, path: canonicalPath },
  ];
  const resultItems = results.items.map((item) => ({
    name: item.name,
    url: buildCanonicalUrl(`/skills/${item.slug}`),
  }));

  return (
    <>
      <JsonLd data={buildBreadcrumbJsonLd(breadcrumbItems)} />
      {resultItems.length > 0 ? (
        <JsonLd
          data={buildItemListJsonLd({
            canonicalPath,
            itemName: `${source.name} skills on SkillJury`,
            items: resultItems,
          })}
        />
      ) : null}
      <SourceHero source={source} />

      <form
        action={`/sources/${encodeSourceSlug(source.slug)}`}
        className="rounded-[1.75rem] border border-border bg-card/80 p-5 shadow-sm"
        method="get"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
              Source listing
            </div>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-foreground">
              {results.totalCount.toLocaleString("en-US")} imported skills
            </h2>
          </div>
          <div className="w-full max-w-xs">
            <SortSelect value={sort} />
          </div>
        </div>
      </form>

      <ResultGrid items={results.items} />

      <PaginationNav
        basePath={`/sources/${encodeSourceSlug(source.slug)}`}
        page={results.page}
        query={{ sort }}
        totalPages={results.totalPages}
      />
    </>
  );
}

export default function SourcePage({ params, searchParams }: SourcePageProps) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 lg:px-10 lg:py-14">
      <Suspense fallback={<SourcePageSkeleton />}>
        <SourcePageContent params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

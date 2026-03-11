import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SortSelect } from "@/components/listing/SortSelect";
import { PaginationNav } from "@/components/listing/PaginationNav";
import { ResultGrid } from "@/components/search/ResultGrid";
import { SourceHero } from "@/components/sources/SourceHero";
import { searchSkills } from "@/lib/db/search";
import { getSourceBySlug } from "@/lib/db/sourcePages";
import { normalizePageParam, normalizeSortParam } from "@/lib/routing/browseParams";
import { decodeSourceSlug, encodeSourceSlug } from "@/lib/routing/sourceSlug";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildSourceMetadataText } from "@/lib/seo/titleTemplates";

type SourcePageProps = {
  params: Promise<{
    sourceSlug: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
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
    pathname: `/sources/${encodeSourceSlug(source.slug)}`,
  });
}

export default async function SourcePage({
  params,
  searchParams,
}: SourcePageProps) {
  const { sourceSlug } = await params;
  const resolvedSearchParams = await searchParams;
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

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 lg:px-10 lg:py-14">
      <SourceHero source={source} />

      <form
        action={`/sources/${encodeSourceSlug(source.slug)}`}
        className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_20px_55px_rgba(15,23,42,0.08)]"
        method="get"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.28em] text-slate-500">
              Source listing
            </div>
            <h2 className="mt-3 font-display text-4xl tracking-tight text-slate-950">
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
    </div>
  );
}

import type { Metadata } from "next";

import { PaginationNav } from "@/components/listing/PaginationNav";
import { ResultGrid } from "@/components/search/ResultGrid";
import { searchSkills } from "@/lib/db/search";
import { normalizePageParam } from "@/lib/routing/browseParams";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildListingMetadataText } from "@/lib/seo/titleTemplates";

type ListingPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = buildListingMetadataText("top-rated");

  return buildPageMetadata({
    title,
    description,
    pathname: "/top-rated",
  });
}

export default async function TopRatedPage({
  searchParams,
}: ListingPageProps) {
  const resolvedSearchParams = await searchParams;
  const page = normalizePageParam(resolvedSearchParams.page);
  const results = await searchSkills({
    page,
    sort: "top-rated",
  });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 lg:px-10 lg:py-14">
      <section className="rounded-xl border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,22,0.96),rgba(10,10,12,0.92))] p-7 shadow-lg">
        <div className="text-xs uppercase tracking-[0.28em] text-zinc-500">
          Listing page
        </div>
        <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight text-white">
          Top rated skills
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-zinc-400">
          Rankings prioritize confidence-adjusted public ratings, then use current
          catalog signals to stabilize ties between similarly reviewed skills.
        </p>
      </section>

      <ResultGrid items={results.items} />

      <PaginationNav
        basePath="/top-rated"
        page={results.page}
        totalPages={results.totalPages}
      />
    </div>
  );
}

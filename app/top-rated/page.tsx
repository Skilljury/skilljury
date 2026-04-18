import type { Metadata } from "next";
import { Suspense } from "react";

import { PaginationNav } from "@/components/listing/PaginationNav";
import { ResultGrid } from "@/components/search/ResultGrid";
import { searchSkills } from "@/lib/db/search";
import { normalizePageParam } from "@/lib/routing/browseParams";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildListingMetadataText } from "@/lib/seo/titleTemplates";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type ListingPageProps = {
  searchParams: SearchParams;
};

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = buildListingMetadataText("top-rated");

  return buildPageMetadata({
    title,
    description,
    pathname: "/top-rated",
  });
}

function ListingResultsSkeleton() {
  return <div className="h-96 animate-pulse rounded-[1.5rem] bg-muted/30" />;
}

async function TopRatedResults({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const page = normalizePageParam(resolvedSearchParams.page);
  const results = await searchSkills({
    page,
    sort: "top-rated",
  });

  return (
    <>
      <ResultGrid items={results.items} />

      <PaginationNav
        basePath="/top-rated"
        page={results.page}
        totalPages={results.totalPages}
      />
    </>
  );
}

export default function TopRatedPage({ searchParams }: ListingPageProps) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 lg:px-10 lg:py-14">
      <section className="rounded-[2rem] border border-border bg-card/80 p-7 shadow-sm">
        <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
          Listing page
        </div>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-foreground">
          Most popular skills
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground">
          The most-installed AI agent skills in the catalog, ordered by weekly
          install volume. Ratings and community reviews are shown when available.
        </p>
      </section>

      <Suspense fallback={<ListingResultsSkeleton />}>
        <TopRatedResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

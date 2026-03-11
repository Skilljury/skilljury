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
  const { title, description } = buildListingMetadataText("trending");

  return buildPageMetadata({
    title,
    description,
    pathname: "/trending",
  });
}

export default async function TrendingPage({
  searchParams,
}: ListingPageProps) {
  const resolvedSearchParams = await searchParams;
  const page = normalizePageParam(resolvedSearchParams.page);
  const results = await searchSkills({
    page,
    sort: "trending",
  });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 lg:px-10 lg:py-14">
      <section className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.16),transparent_30%),linear-gradient(135deg,#09111f,#0f172a_60%,#111827)] p-7 text-white shadow-[0_35px_100px_rgba(0,0,0,0.35)]">
        <div className="text-xs uppercase tracking-[0.28em] text-slate-400">
          Listing page
        </div>
        <h1 className="mt-4 font-display text-5xl tracking-tight">
          Trending skills
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
          This view ranks the live catalog by weekly install activity, then
          stabilizes the order with freshness and name-based tiebreaks.
        </p>
      </section>

      <ResultGrid items={results.items} />

      <PaginationNav
        basePath="/trending"
        page={results.page}
        totalPages={results.totalPages}
      />
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CategoryHero } from "@/components/categories/CategoryHero";
import { PaginationNav } from "@/components/listing/PaginationNav";
import { SortSelect } from "@/components/listing/SortSelect";
import { ResultGrid } from "@/components/search/ResultGrid";
import { getCategoryBySlug } from "@/lib/db/categories";
import { searchSkills } from "@/lib/db/search";
import { normalizePageParam, normalizeSortParam } from "@/lib/routing/browseParams";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildCategoryMetadataText } from "@/lib/seo/titleTemplates";

type CategoryPageProps = {
  params: Promise<{
    categorySlug: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);

  if (!category) {
    return buildPageMetadata({
      title: "Category not found | SkillJury",
      description: "The requested category does not exist in the current SkillJury taxonomy.",
      pathname: `/categories/${categorySlug}`,
    });
  }

  const { title, description } = buildCategoryMetadataText(category.name);
  return buildPageMetadata({
    title,
    description,
    pathname: `/categories/${category.slug}`,
  });
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { categorySlug } = await params;
  const resolvedSearchParams = await searchParams;
  const category = await getCategoryBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  const page = normalizePageParam(resolvedSearchParams.page);
  const sort = normalizeSortParam(resolvedSearchParams.sort);
  const results = await searchSkills({
    categoryId: category.id,
    page,
    sort,
  });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 lg:px-10 lg:py-14">
      <CategoryHero category={category} />

      <form
        action={`/categories/${category.slug}`}
        className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_20px_55px_rgba(15,23,42,0.08)]"
        method="get"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.28em] text-slate-500">
              Catalog listing
            </div>
            <h2 className="mt-3 font-display text-4xl tracking-tight text-slate-950">
              {results.totalCount.toLocaleString("en-US")} skills
            </h2>
          </div>
          <div className="w-full max-w-xs">
            <SortSelect value={sort} />
          </div>
        </div>
      </form>

      <ResultGrid items={results.items} />

      <PaginationNav
        basePath={`/categories/${category.slug}`}
        page={results.page}
        query={{ sort }}
        totalPages={results.totalPages}
      />
    </div>
  );
}

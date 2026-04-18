import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { PaginationNav } from "@/components/listing/PaginationNav";
import { SortButtonGroup } from "@/components/listing/SortButtonGroup";
import { JsonLd } from "@/components/seo/JsonLd";
import { ResultGrid } from "@/components/search/ResultGrid";
import { getCategoryDescription } from "@/lib/catalog/categoryDescriptions";
import { getCategoryBySlug } from "@/lib/db/categories";
import { searchSkills } from "@/lib/db/search";
import { normalizePageParam, normalizeSortParam } from "@/lib/routing/browseParams";
import { buildCanonicalUrl, buildPageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbJsonLd, buildItemListJsonLd } from "@/lib/seo/schema";
import { buildCategoryMetadataText } from "@/lib/seo/titleTemplates";

type Params = Promise<{ categorySlug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type CategoryPageProps = {
  params: Params;
  searchParams: SearchParams;
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

  const editorialDescription = getCategoryDescription(category.slug);
  const { title, description } = buildCategoryMetadataText(category.name);
  return buildPageMetadata({
    title,
    description: editorialDescription ?? description,
    pathname: `/categories/${category.slug}`,
  });
}

function CategoryPageSkeleton() {
  return (
    <>
      <div className="h-40 animate-pulse rounded-[1.5rem] bg-muted/30" />
      <div className="h-96 animate-pulse rounded-[1.5rem] bg-muted/30" />
    </>
  );
}

async function CategoryPageContent({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const [{ categorySlug }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
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
  const canonicalPath = `/categories/${category.slug}`;
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: category.name, path: canonicalPath },
  ];
  const editorialDescription = getCategoryDescription(category.slug);
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
            itemName: `${category.name} skills on SkillJury`,
            items: resultItems,
          })}
        />
      ) : null}
      <section className="space-y-4">
        <Link
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-default hover:text-foreground"
          href="/"
        >
          <span aria-hidden="true">←</span>
          <span>Back to registry</span>
        </Link>
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {category.name}
          </h1>
          {(editorialDescription ?? category.description) ? (
            <p className="max-w-3xl text-lg text-foreground/80">
              {editorialDescription ?? category.description}
            </p>
          ) : null}
          <p className="mt-3 font-mono text-sm text-muted-foreground">
            {results.totalCount.toLocaleString("en-US")} skills
            {category.reviewedSkillCount > 0
              ? ` · ${category.reviewedSkillCount.toLocaleString("en-US")} reviewed`
              : ""}
          </p>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.34em] text-muted-foreground">
            Skills in this category
          </h2>
          <SortButtonGroup basePath={`/categories/${category.slug}`} value={sort} />
        </div>
        <ResultGrid
          emptyCopy="No skills in this category yet."
          emptyTitle="Category empty"
          items={results.items}
        />
      </section>

      <PaginationNav
        basePath={`/categories/${category.slug}`}
        page={results.page}
        query={{ sort }}
        totalPages={results.totalPages}
      />
    </>
  );
}

export default function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <Suspense fallback={<CategoryPageSkeleton />}>
        <CategoryPageContent params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

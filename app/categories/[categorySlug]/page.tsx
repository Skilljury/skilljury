import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import {
  EMERGENCY_CATEGORIES,
  EMERGENCY_CATALOG_SNAPSHOT_AT,
} from "@/lib/data/emergencyCatalog";
import { buildPageMetadata } from "@/lib/seo/metadata";

type CategoryPageProps = {
  params: Promise<{ categorySlug: string }>;
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = EMERGENCY_CATEGORIES.find((item) => item.slug === categorySlug);

  if (!category) {
    return buildPageMetadata({
      title: "Category unavailable in recovery snapshot | SkillJury",
      description:
        "This category is not included in SkillJury's temporary recovery snapshot.",
      indexable: false,
      pathname: `/categories/${categorySlug}`,
    });
  }

  return buildPageMetadata({
    title: `${category.name} snapshot count | SkillJury`,
    description: `${category.skillCount.toLocaleString("en-US")} skills were assigned to ${category.name} in SkillJury's aggregate recovery snapshot. A browsable category result set is temporarily unavailable.`,
    indexable: false,
    pathname: `/categories/${category.slug}`,
  });
}

async function CategoryContent({ params }: CategoryPageProps) {
  const { categorySlug } = await params;
  const category = EMERGENCY_CATEGORIES.find((item) => item.slug === categorySlug);

  if (!category) {
    notFound();
  }

  const snapshotDate = new Date(EMERGENCY_CATALOG_SNAPSHOT_AT).toLocaleString(
    "en-US",
    { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" },
  );

  return (
    <>
      <Link
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        href="/"
      >
        <span aria-hidden="true">←</span>
        Back to recovery catalog
      </Link>

      <section className="rounded-[2rem] border border-border bg-card/80 p-7 shadow-sm sm:p-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-amber-200">
          Aggregate snapshot count
        </div>
        <h1 className="font-display mt-6 text-balance text-4xl tracking-[-0.04em] text-foreground sm:text-6xl">
          {category.name}
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground">
          {category.skillCount.toLocaleString("en-US")} skills were assigned to this category in the PostgreSQL snapshot captured {snapshotDate}. This page does not currently expose a browsable category result set while Supabase API access is restricted.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            className="rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-95"
            href="/search"
          >
            Browse fully visible skills
          </Link>
          <Link
            className="rounded-full border border-border px-5 py-3 text-sm text-foreground hover:border-primary/30"
            href="/"
          >
            View snapshot overview
          </Link>
        </div>
      </section>
    </>
  );
}

function CategorySkeleton() {
  return <div className="h-80 animate-pulse rounded-[2rem] bg-muted/30" />;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <Suspense fallback={<CategorySkeleton />}>
        <CategoryContent params={params} />
      </Suspense>
    </div>
  );
}

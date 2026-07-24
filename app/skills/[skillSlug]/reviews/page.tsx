import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { buildPageMetadata } from "@/lib/seo/metadata";

type SkillReviewsPageProps = {
  params: Promise<{
    skillSlug: string;
  }>;
};

export async function generateMetadata({
  params,
}: SkillReviewsPageProps): Promise<Metadata> {
  const { skillSlug } = await params;

  return buildPageMetadata({
    title: "Reviews temporarily unavailable | SkillJury",
    description:
      "Skill reviews are temporarily unavailable while SkillJury operates as a read-only recovery catalog.",
    indexable: false,
    pathname: `/skills/${skillSlug}/reviews`,
  });
}

function SkillReviewsFallback() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-10 lg:px-10 lg:py-14">
      <div className="h-80 animate-pulse rounded-[2rem] bg-muted/30" />
    </div>
  );
}

async function SkillReviewsContent({
  params,
}: SkillReviewsPageProps) {
  const { skillSlug } = await params;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-10 lg:px-10 lg:py-14">
      <section className="rounded-[2rem] border border-border bg-card/80 p-7 shadow-sm sm:p-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-amber-200">
          Read-only recovery catalog
        </div>
        <h1 className="font-display mt-6 text-balance text-4xl tracking-[-0.04em] text-foreground sm:text-6xl">
          Reviews are temporarily unavailable
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground">
          SkillJury is currently serving a verified, read-only recovery catalog while live
          provider access is restricted. Public reviews, rating summaries, reporting, and
          review submission will return only after the live data service is safely restored.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            className="rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-95"
            href={`/skills/${skillSlug}`}
          >
            Back to skill
          </Link>
          <Link
            className="rounded-full border border-border px-5 py-3 text-sm text-foreground hover:border-primary/30"
            href="/search"
          >
            Browse visible skills
          </Link>
        </div>
      </section>
    </div>
  );
}

export default function SkillReviewsPage({ params }: SkillReviewsPageProps) {
  return (
    <Suspense fallback={<SkillReviewsFallback />}>
      <SkillReviewsContent params={params} />
    </Suspense>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

type ReviewPageProps = {
  params: Promise<{
    skillSlug: string;
  }>;
};

export const metadata: Metadata = {
  title: "Review submission temporarily unavailable | SkillJury",
  description:
    "Review submission is temporarily unavailable while SkillJury operates as a read-only recovery catalog.",
  robots: {
    index: false,
    follow: false,
  },
};

function ReviewSubmissionFallback() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-10 lg:px-10 lg:py-14">
      <div className="h-80 animate-pulse rounded-[2rem] bg-muted/30" />
    </div>
  );
}

async function ReviewSubmissionContent({ params }: ReviewPageProps) {
  const { skillSlug } = await params;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-10 lg:px-10 lg:py-14">
      <section className="rounded-[2rem] border border-border bg-card/80 p-7 shadow-sm sm:p-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-amber-200">
          Read-only recovery catalog
        </div>
        <h1 className="font-display mt-6 text-balance text-4xl tracking-[-0.04em] text-foreground sm:text-6xl">
          Review submission is temporarily unavailable
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground">
          SkillJury is currently serving a verified, read-only recovery catalog while live
          provider access is restricted. Sign-in, review submission, moderation, and rating
          updates will return only after the live data service is safely restored.
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

export default function SkillReviewPage({ params }: ReviewPageProps) {
  return (
    <Suspense fallback={<ReviewSubmissionFallback />}>
      <ReviewSubmissionContent params={params} />
    </Suspense>
  );
}

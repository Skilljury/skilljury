import type { Metadata } from "next";
import Link from "next/link";

import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Sign-in temporarily unavailable | SkillJury",
    description:
      "SkillJury is currently serving a read-only recovery catalog. Sign-in, account creation, reviews, submissions, and profile management are temporarily unavailable.",
    indexable: false,
    pathname: "/login",
  });
}

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-10 lg:px-10 lg:py-14">
      <section className="rounded-[2rem] border border-border bg-card/80 px-6 py-8 shadow-sm lg:px-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-amber-200">
          Recovery snapshot
        </div>
        <h1 className="mt-6 text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
          Sign-in is temporarily unavailable.
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground">
          SkillJury is currently serving a read-only recovery catalog while live provider access is restricted. Account creation, sign-in, reviews, submissions, saved skills, and profile management will return when live service is restored.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            className="inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-default hover:bg-primary/90"
            href="/search"
          >
            Search the recovery catalog
          </Link>
          <Link
            className="inline-flex rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground transition-default hover:bg-surface-hover"
            href="/"
          >
            Back to catalog
          </Link>
        </div>
      </section>
    </div>
  );
}

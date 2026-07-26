import type { Metadata } from "next";
import Link from "next/link";

import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "SkillJury account access temporarily unavailable",
    description:
      "Account access is temporarily unavailable while SkillJury serves a read-only recovery catalog.",
    indexable: false,
    pathname: "/account",
  });
}

export default function AccountPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10 lg:px-10 lg:py-14">
      <section className="rounded-[2rem] border border-border bg-card/80 p-7 shadow-sm sm:p-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-amber-200">
          Read-only recovery catalog
        </div>
        <h1 className="font-display mt-6 text-balance text-4xl tracking-[-0.04em] text-foreground sm:text-6xl">
          Account access is temporarily unavailable.
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground">
          SkillJury is currently serving a verified read-only recovery catalog while live provider access is restricted. Sign-in, reviewer profiles, saved skills, GitHub linking, and account settings will return when the live service is restored.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            className="rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-95"
            href="/search"
          >
            Browse visible skills
          </Link>
          <Link
            className="rounded-full border border-border px-5 py-3 text-sm text-foreground hover:border-primary/30"
            href="/"
          >
            Back to recovery catalog
          </Link>
        </div>
      </section>
    </div>
  );
}

import type { Metadata } from "next";

import { AuthCallbackClient } from "@/components/auth/AuthCallbackClient";
import { getSafeNextPath } from "@/lib/auth/redirects";
import { buildPageMetadata } from "@/lib/seo/metadata";

type AuthCallbackPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Completing your SkillJury sign-in",
    description:
      "Complete your SkillJury magic-link sign-in and sync your reviewer profile.",
    pathname: "/auth/callback",
  });
}

export default async function AuthCallbackPage({
  searchParams,
}: AuthCallbackPageProps) {
  const resolvedSearchParams = await searchParams;
  const nextPath = getSafeNextPath(firstParam(resolvedSearchParams.next));

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-10 lg:px-10 lg:py-14">
      <section className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(247,212,138,0.16),transparent_35%),linear-gradient(135deg,#0f172a,#050816_65%)] px-6 py-8 text-white shadow-[0_45px_120px_rgba(0,0,0,0.45)] lg:px-10">
        <div className="text-xs uppercase tracking-[0.28em] text-slate-400">
          Magic link callback
        </div>
        <h1 className="mt-4 font-display text-5xl tracking-tight sm:text-6xl">
          Completing your SkillJury sign-in
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
          SkillJury is verifying your sign-in link and restoring your reviewer
          session before you continue.
        </p>
      </section>

      <AuthCallbackClient nextPath={nextPath} />
    </div>
  );
}

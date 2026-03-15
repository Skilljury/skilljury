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
    title: "Completing your SkillJury account flow",
    description:
      "Complete your SkillJury login, signup confirmation, or social sign-in and sync your reviewer profile.",
    indexable: false,
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
      <section className="rounded-xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_35%),linear-gradient(135deg,#18181b,#09090b_70%)] px-6 py-8 text-white shadow-xl lg:px-10">
        <div className="text-xs uppercase tracking-[0.28em] text-zinc-500">
          Auth callback
        </div>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">
          Completing your SkillJury account flow
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-zinc-300">
          SkillJury is restoring your session, syncing your account, and routing you
          to the next step.
        </p>
      </section>

      <AuthCallbackClient nextPath={nextPath} />
    </div>
  );
}

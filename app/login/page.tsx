import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { MagicLinkForm } from "@/components/auth/MagicLinkForm";
import { buildAuthRedirectUrl, getSafeNextPath } from "@/lib/auth/redirects";
import { getCurrentViewer } from "@/lib/auth/session";
import { buildPageMetadata } from "@/lib/seo/metadata";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Sign in to SkillJury | Magic link login",
    description:
      "Sign in to SkillJury with a magic link so you can review skills and manage your account.",
    pathname: "/login",
  });
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const nextPath = getSafeNextPath(firstParam(resolvedSearchParams.next));
  const errorMessage = firstParam(resolvedSearchParams.error);
  const viewer = await getCurrentViewer();

  if (viewer.user) {
    redirect(nextPath);
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-10 lg:px-10 lg:py-14">
      <section className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(247,212,138,0.16),transparent_35%),linear-gradient(135deg,#0f172a,#050816_65%)] px-6 py-8 text-white shadow-[0_45px_120px_rgba(0,0,0,0.45)] lg:px-10">
        <div className="text-xs uppercase tracking-[0.28em] text-slate-400">
          Account access
        </div>
        <h1 className="mt-4 font-display text-5xl tracking-tight sm:text-6xl">
          Sign in to write SkillJury reviews.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
          Use a passwordless magic link. Once you are signed in, you can review
          skills, link GitHub as a trust signal, and manage your reviewer profile.
        </p>
      </section>

      {errorMessage ? (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50/80 p-5 text-sm leading-7 text-rose-800">
          {errorMessage}
        </div>
      ) : null}

      <MagicLinkForm
        adminEmail={viewer.adminEmail}
        redirectTo={buildAuthRedirectUrl(nextPath)}
      />
    </div>
  );
}

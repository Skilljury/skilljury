import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthPanel } from "@/components/auth/AuthPanel";
import { getSafeNextPath } from "@/lib/auth/redirects";
import { isGoogleAuthEnabled } from "@/lib/auth/providerFlags";
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
    title: "Log in or sign up for SkillJury",
    description:
      "Create a SkillJury account with Google or email and password so you can review skills and manage your public profile.",
    indexable: false,
    pathname: "/login",
  });
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const nextPath = getSafeNextPath(firstParam(resolvedSearchParams.next));
  const errorMessage = firstParam(resolvedSearchParams.error);
  const googleAuthEnabled = isGoogleAuthEnabled();
  const viewer = await getCurrentViewer();

  if (viewer.user) {
    if (!viewer.profile?.username) {
      redirect(`/account/setup?next=${encodeURIComponent(nextPath)}`);
    }

    redirect(nextPath);
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-10 lg:px-10 lg:py-14">
      <section className="rounded-xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_35%),linear-gradient(135deg,#18181b,#09090b_70%)] px-6 py-8 text-white shadow-xl lg:px-10">
        <div className="text-xs uppercase tracking-[0.28em] text-zinc-500">
          Account access
        </div>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">
          Create a real SkillJury account.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-zinc-300">
          {googleAuthEnabled
            ? "Use Google or create an account with email, password, and a public reviewer ID. Once you are in, you can review skills, link GitHub as an extra trust signal, and manage your public profile."
            : "Create an account with email, password, and a public reviewer ID. Google sign-in will appear here once the provider is enabled for this deployment. Once you are in, you can review skills, link GitHub as an extra trust signal, and manage your public profile."}
        </p>
      </section>

      {errorMessage ? (
        <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-5 text-sm leading-7 text-rose-100">
          {errorMessage}
        </div>
      ) : null}

      <AuthPanel googleAuthEnabled={googleAuthEnabled} nextPath={nextPath} />
    </div>
  );
}

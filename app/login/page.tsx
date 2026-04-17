import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

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

function LoginShell({
  errorMessage,
  googleAuthEnabled,
}: {
  errorMessage: string;
  googleAuthEnabled: boolean;
}) {
  return (
    <>
      <section className="rounded-[2rem] border border-border bg-card/80 px-6 py-8 shadow-sm lg:px-10">
        <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
          Account access
        </div>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
          Create a real SkillJury account.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground">
          {googleAuthEnabled
            ? "Use Google or create an account with email, password, and a public reviewer ID. Once you are in, you can review skills, link GitHub as an extra trust signal, and manage your public profile."
            : "Create an account with email, password, and a public reviewer ID. Google sign-in will appear here once the provider is enabled for this deployment. Once you are in, you can review skills, link GitHub as an extra trust signal, and manage your public profile."}
        </p>
      </section>

      {errorMessage ? (
        <div className="rounded-[1.5rem] border border-destructive/20 bg-destructive/10 p-5 text-sm leading-7 text-destructive">
          {errorMessage}
        </div>
      ) : null}
    </>
  );
}

function AuthPanelSkeleton() {
  return (
    <div className="rounded-[2rem] border border-border bg-card/80 p-8 shadow-sm">
      <div className="h-6 w-40 animate-pulse rounded bg-muted/40" />
      <div className="mt-6 space-y-4">
        <div className="h-11 w-full animate-pulse rounded bg-muted/30" />
        <div className="h-11 w-full animate-pulse rounded bg-muted/30" />
        <div className="h-11 w-32 animate-pulse rounded bg-muted/40" />
      </div>
    </div>
  );
}

async function LoginContent({
  nextPath,
  googleAuthEnabled,
}: {
  nextPath: string;
  googleAuthEnabled: boolean;
}) {
  const viewer = await getCurrentViewer();

  if (viewer.user) {
    if (!viewer.profile?.username) {
      redirect(`/account/setup?next=${encodeURIComponent(nextPath)}`);
    }

    redirect(nextPath);
  }

  return <AuthPanel googleAuthEnabled={googleAuthEnabled} nextPath={nextPath} />;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const nextPath = getSafeNextPath(firstParam(resolvedSearchParams.next));
  const errorMessage = firstParam(resolvedSearchParams.error);
  const googleAuthEnabled = isGoogleAuthEnabled();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-10 lg:px-10 lg:py-14">
      <LoginShell errorMessage={errorMessage} googleAuthEnabled={googleAuthEnabled} />
      <Suspense fallback={<AuthPanelSkeleton />}>
        <LoginContent nextPath={nextPath} googleAuthEnabled={googleAuthEnabled} />
      </Suspense>
    </div>
  );
}

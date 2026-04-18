import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthCallbackClient } from "@/components/auth/AuthCallbackClient";
import { getSafeNextPath } from "@/lib/auth/redirects";
import { buildPageMetadata } from "@/lib/seo/metadata";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type AuthCallbackPageProps = {
  searchParams: SearchParams;
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

function CallbackClientSkeleton() {
  return (
    <div className="rounded-[1.5rem] border border-border bg-card/80 p-6 shadow-sm">
      <div className="h-5 w-48 animate-pulse rounded bg-muted/40" />
      <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-muted/30" />
    </div>
  );
}

async function AuthCallbackInner({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const nextPath = getSafeNextPath(firstParam(resolvedSearchParams.next));

  return <AuthCallbackClient nextPath={nextPath} />;
}

export default function AuthCallbackPage({
  searchParams,
}: AuthCallbackPageProps) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-10 lg:px-10 lg:py-14">
      <section className="rounded-[2rem] border border-border bg-card/80 px-6 py-8 shadow-sm lg:px-10">
        <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
          Auth callback
        </div>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
          Completing your SkillJury account flow
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground">
          SkillJury is restoring your session, syncing your account, and routing you
          to the next step.
        </p>
      </section>

      <Suspense fallback={<CallbackClientSkeleton />}>
        <AuthCallbackInner searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

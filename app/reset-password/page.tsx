import type { Metadata } from "next";
import { Suspense } from "react";

import { PasswordUpdateForm } from "@/components/auth/PasswordUpdateForm";
import { getSafeNextPath } from "@/lib/auth/redirects";
import { buildPageMetadata } from "@/lib/seo/metadata";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type ResetPasswordPageProps = {
  searchParams: SearchParams;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Reset your SkillJury password",
    description:
      "Set a new password for your SkillJury account after opening the recovery link.",
    indexable: false,
    pathname: "/reset-password",
  });
}

function FormSkeleton() {
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

async function ResetPasswordFormWrapper({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const nextPath = getSafeNextPath(firstParam(resolvedSearchParams.next));

  return <PasswordUpdateForm nextPath={nextPath} />;
}

export default function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-10 lg:px-10 lg:py-14">
      <section className="rounded-[2rem] border border-border bg-card/80 px-6 py-8 shadow-sm lg:px-10">
        <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
          Password recovery
        </div>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
          Reset your SkillJury password
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground">
          Set a new password to restore access to your SkillJury account.
        </p>
      </section>

      <Suspense fallback={<FormSkeleton />}>
        <ResetPasswordFormWrapper searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

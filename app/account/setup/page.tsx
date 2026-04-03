import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ProfileSettingsForm } from "@/components/auth/ProfileSettingsForm";
import { getSafeNextPath } from "@/lib/auth/redirects";
import { requireSignedInUser } from "@/lib/auth/guards";
import { buildPageMetadata } from "@/lib/seo/metadata";

type AccountSetupPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Finish your SkillJury account setup",
    description:
      "Choose your public SkillJury username so you can review skills and submit catalog entries.",
    indexable: false,
    pathname: "/account/setup",
  });
}

export default async function AccountSetupPage({
  searchParams,
}: AccountSetupPageProps) {
  const resolvedSearchParams = await searchParams;
  const nextPath = getSafeNextPath(firstParam(resolvedSearchParams.next));
  const viewer = await requireSignedInUser("/account/setup");

  if (viewer.profile?.username) {
    redirect(nextPath);
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10 lg:px-10 lg:py-14">
      <section className="rounded-[2rem] border border-border bg-card/80 p-7 shadow-sm">
        <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
          Account setup
        </div>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-foreground">
          Choose your public SkillJury ID.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground">
          Before you submit reviews or skills, pick the public name and ID that will
          appear on your account.
        </p>
      </section>

      <ProfileSettingsForm
        initialDisplayName={
          viewer.profile?.displayName ?? viewer.user?.email?.split("@")[0] ?? ""
        }
        initialUsername=""
        mode="setup"
        nextPath={nextPath}
      />
    </div>
  );
}

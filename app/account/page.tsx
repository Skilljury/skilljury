import type { Metadata } from "next";

import { GitHubConnectButton } from "@/components/auth/GitHubConnectButton";
import { ProfileSettingsForm } from "@/components/auth/ProfileSettingsForm";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { requireSignedInUser } from "@/lib/auth/guards";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Your SkillJury account",
    description:
      "Manage your SkillJury reviewer account, public identity, and optional GitHub trust signal.",
    indexable: false,
    pathname: "/account",
  });
}

function formatDate(value: string | null) {
  if (!value) {
    return "Unknown";
  }

  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function AccountPage() {
  const viewer = await requireSignedInUser("/account");
  const user = viewer.user!;
  const supabase = createServiceRoleSupabaseClient();
  const { count: reviewCount } = await supabase
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10 lg:px-10 lg:py-14">
      <section className="rounded-[2rem] border border-border bg-card/80 p-7 shadow-sm">
        <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
          Reviewer profile
        </div>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-foreground">
          Your SkillJury account
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground">
          Manage the public ID used on your reviews, connect GitHub as an optional
          trust signal, and control the account you use across SkillJury.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] border border-border bg-card/80 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Account details</h2>
          <dl className="mt-5 grid gap-4 text-sm">
            <div>
              <dt className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                Email
              </dt>
              <dd className="mt-2 text-foreground">{user.email ?? "Unknown"}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                Username / ID
              </dt>
              <dd className="mt-2 text-foreground">
                {viewer.profile?.username ?? "Not chosen yet"}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                Display name
              </dt>
              <dd className="mt-2 text-foreground">
                {viewer.profile?.displayName ?? viewer.profile?.username ?? "SkillJury user"}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                Role
              </dt>
              <dd className="mt-2 text-foreground">{viewer.profile?.role ?? "user"}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                Account status
              </dt>
              <dd className="mt-2 text-foreground">
                {viewer.profile?.accountStatus ?? "active"}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                Joined
              </dt>
              <dd className="mt-2 text-foreground">
                {formatDate(viewer.profile?.joinedAt ?? null)}
              </dd>
            </div>
          </dl>
          <div className="mt-6">
            <SignOutButton />
          </div>
        </section>

        <section className="rounded-[2rem] border border-border bg-card/80 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Trust signals</h2>
          <div className="mt-5 space-y-5 text-sm leading-7 text-muted-foreground">
            <div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                Reviews submitted
              </div>
              <div className="mt-2 font-mono text-3xl font-semibold text-foreground">
                {(reviewCount ?? 0).toLocaleString("en-US")}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                GitHub identity
              </div>
              <p className="mt-2">
                Link GitHub to show that your reviews come from a real builder profile.
              </p>
            </div>
            <GitHubConnectButton
              githubUsername={viewer.profile?.githubUsername ?? null}
              isLinked={viewer.profile?.isGithubLinked ?? false}
              nextPath="/account"
            />
          </div>
        </section>
      </div>

      <ProfileSettingsForm
        initialDisplayName={
          viewer.profile?.displayName ?? viewer.profile?.username ?? user.email?.split("@")[0] ?? ""
        }
        initialUsername={viewer.profile?.username ?? ""}
        mode="account"
        nextPath="/account"
      />
    </div>
  );
}

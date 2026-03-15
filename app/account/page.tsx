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
      <section className="rounded-xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.1),transparent_35%),linear-gradient(135deg,rgba(20,20,24,0.98),rgba(8,8,10,0.96))] p-7 shadow-xl">
        <div className="text-xs uppercase tracking-[0.28em] text-zinc-500">
          Reviewer profile
        </div>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-white">
          Your SkillJury account
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-zinc-300">
          Manage the public ID used on your reviews, connect GitHub as an optional
          trust signal, and control the account you use across SkillJury.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-xl border border-white/10 bg-white/[0.04] p-6 shadow-md">
          <h2 className="text-lg font-semibold text-white">Account details</h2>
          <dl className="mt-5 grid gap-4 text-sm">
            <div>
              <dt className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                Email
              </dt>
              <dd className="mt-2 text-white">{user.email ?? "Unknown"}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                Username / ID
              </dt>
              <dd className="mt-2 text-white">
                {viewer.profile?.username ?? "Not chosen yet"}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                Display name
              </dt>
              <dd className="mt-2 text-white">
                {viewer.profile?.displayName ?? viewer.profile?.username ?? "SkillJury user"}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                Role
              </dt>
              <dd className="mt-2 text-white">{viewer.profile?.role ?? "user"}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                Account status
              </dt>
              <dd className="mt-2 text-white">
                {viewer.profile?.accountStatus ?? "active"}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                Joined
              </dt>
              <dd className="mt-2 text-white">
                {formatDate(viewer.profile?.joinedAt ?? null)}
              </dd>
            </div>
          </dl>
          <div className="mt-6">
            <SignOutButton />
          </div>
        </section>

        <section className="rounded-xl border border-white/10 bg-white/[0.04] p-6 shadow-md">
          <h2 className="text-lg font-semibold text-white">Trust signals</h2>
          <div className="mt-5 space-y-5 text-sm leading-7 text-zinc-300">
            <div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                Reviews submitted
              </div>
              <div className="mt-2 font-mono text-3xl font-semibold text-white">
                {(reviewCount ?? 0).toLocaleString("en-US")}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">
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

import type { Metadata } from "next";

import { GitHubConnectButton } from "@/components/auth/GitHubConnectButton";
import { buildAuthRedirectUrl } from "@/lib/auth/redirects";
import { requireSignedInUser } from "@/lib/auth/guards";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Your SkillJury account",
    description:
      "Manage your SkillJury reviewer account and optional GitHub trust signal.",
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
      <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
        <div className="text-xs uppercase tracking-[0.28em] text-slate-500">
          Reviewer profile
        </div>
        <h1 className="mt-4 font-display text-5xl tracking-tight text-slate-950">
          Your SkillJury account
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
          Magic-link access is active for this account. Optional GitHub linking adds
          a stronger public trust signal to your reviews.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
          <h2 className="text-lg font-semibold text-slate-950">Account details</h2>
          <dl className="mt-5 grid gap-4 text-sm">
            <div>
              <dt className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Email</dt>
              <dd className="mt-2 text-slate-950">{user.email ?? "Unknown"}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Display name</dt>
              <dd className="mt-2 text-slate-950">
                {viewer.profile?.displayName ?? viewer.profile?.username ?? "SkillJury user"}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Role</dt>
              <dd className="mt-2 text-slate-950">{viewer.profile?.role ?? "user"}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Account status</dt>
              <dd className="mt-2 text-slate-950">{viewer.profile?.accountStatus ?? "active"}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Joined</dt>
              <dd className="mt-2 text-slate-950">{formatDate(viewer.profile?.joinedAt ?? null)}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
          <h2 className="text-lg font-semibold text-slate-950">Trust signals</h2>
          <div className="mt-5 space-y-5 text-sm leading-7 text-slate-600">
            <div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                Reviews submitted
              </div>
              <div className="mt-2 font-mono text-3xl font-semibold text-slate-950">
                {(reviewCount ?? 0).toLocaleString("en-US")}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                GitHub identity
              </div>
              <p className="mt-2">
                Link GitHub to show that your reviews come from a real builder profile.
              </p>
            </div>
            <GitHubConnectButton
              githubUsername={viewer.profile?.githubUsername ?? null}
              isLinked={viewer.profile?.isGithubLinked ?? false}
              redirectTo={buildAuthRedirectUrl("/account")}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

import type { Metadata } from "next";

import { SubmitSkillForm } from "@/components/submissions/SubmitSkillForm";
import { requireProfileIdentity } from "@/lib/auth/guards";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getTurnstileSiteKey } from "@/lib/supabase/config";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Submit a New AI Agent Skill for Review | SkillJury",
    description:
      "Submit a new AI agent skill to SkillJury so moderators can review it and add it to the public catalog.",
    indexable: false,
    pathname: "/submit-skill",
  });
}

export default async function SubmitSkillPage() {
  await requireProfileIdentity("/submit-skill");

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10 lg:px-10 lg:py-14">
      <section className="rounded-xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.1),transparent_35%),linear-gradient(135deg,rgba(20,20,24,0.98),rgba(8,8,10,0.96))] p-7 shadow-xl">
        <div className="text-xs uppercase tracking-[0.28em] text-zinc-500">
          Catalog growth
        </div>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-white">
          Submit a New AI Agent Skill for Review
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-zinc-300">
          Share a public repository and, if available, the public skill page. SkillJury
          will prefill whatever it can from the repository metadata, then send the
          submission into moderation before it goes live.
        </p>
      </section>

      <SubmitSkillForm turnstileSiteKey={getTurnstileSiteKey()} />
    </div>
  );
}

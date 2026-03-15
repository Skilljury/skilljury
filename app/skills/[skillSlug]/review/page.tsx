import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ReviewForm } from "@/components/reviews/ReviewForm";
import { requireProfileIdentity } from "@/lib/auth/guards";
import { getSkillBySlug } from "@/lib/db/skills";
import { getSkillReviews } from "@/lib/reviews/getSkillReviews";
import { getTurnstileSiteKey } from "@/lib/supabase/config";
import { buildPageMetadata } from "@/lib/seo/metadata";

type ReviewPageProps = {
  params: Promise<{
    skillSlug: string;
  }>;
};

export async function generateMetadata({
  params,
}: ReviewPageProps): Promise<Metadata> {
  const { skillSlug } = await params;
  const skill = await getSkillBySlug(skillSlug);

  return buildPageMetadata({
    title: skill
      ? `Write a review for ${skill.name} | SkillJury`
      : "Write a review | SkillJury",
    description: skill
      ? `Share your experience with ${skill.name} on SkillJury.`
      : "Share your experience with a SkillJury catalog entry.",
    indexable: false,
    pathname: `/skills/${skillSlug}/review`,
  });
}

export default async function SkillReviewPage({ params }: ReviewPageProps) {
  const { skillSlug } = await params;
  const viewer = await requireProfileIdentity(`/skills/${skillSlug}/review`);
  const user = viewer.user!;
  const skill = await getSkillBySlug(skillSlug);

  if (!skill) {
    notFound();
  }

  const reviewBundle = await getSkillReviews({
    skillId: skill.id,
    viewerUserId: user.id,
  });

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10 lg:px-10 lg:py-14">
      <section className="rounded-xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.1),transparent_35%),linear-gradient(135deg,rgba(20,20,24,0.98),rgba(8,8,10,0.96))] p-7 shadow-xl">
        <div className="text-xs uppercase tracking-[0.28em] text-zinc-500">
          Review submission
        </div>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-white">
          Write a review for {skill.name}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-zinc-300">
          Required fields stay minimal so the form is fast to finish. Optional detail
          fields are available inside the expandable section.
        </p>
      </section>

      {reviewBundle.viewerReview ? (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-5 text-sm leading-7 text-amber-100">
          You have already submitted a review for this skill. Go back to the{" "}
          <Link
            className="underline decoration-white/30 underline-offset-4"
            href={`/skills/${skill.slug}`}
          >
            skill page
          </Link>{" "}
          to see its current public status.
        </div>
      ) : (
        <ReviewForm
          agents={skill.agentInstallData.map((agent) => ({
            name: agent.agentName,
            slug: agent.agentSlug,
          }))}
          skillName={skill.name}
          skillSlug={skill.slug}
          turnstileSiteKey={getTurnstileSiteKey()}
        />
      )}
    </div>
  );
}

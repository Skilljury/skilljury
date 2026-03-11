import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ReviewForm } from "@/components/reviews/ReviewForm";
import { requireSignedInUser } from "@/lib/auth/guards";
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
    pathname: `/skills/${skillSlug}/review`,
  });
}

export default async function SkillReviewPage({ params }: ReviewPageProps) {
  const { skillSlug } = await params;
  const viewer = await requireSignedInUser(`/skills/${skillSlug}/review`);
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
      <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
        <div className="text-xs uppercase tracking-[0.28em] text-slate-500">
          Review submission
        </div>
        <h1 className="mt-4 font-display text-5xl tracking-tight text-slate-950">
          Write a review for {skill.name}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
          Required fields stay minimal so the form is fast to finish. Optional detail
          fields are available inside the expandable section.
        </p>
      </section>

      {reviewBundle.viewerReview ? (
        <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50/80 p-5 text-sm leading-7 text-amber-950">
          You have already submitted a review for this skill. Go back to the{" "}
          <Link className="underline underline-offset-4" href={`/skills/${skill.slug}`}>
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

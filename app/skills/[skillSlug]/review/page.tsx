import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ReviewForm } from "@/components/reviews/ReviewForm";
import { requireProfileIdentity } from "@/lib/auth/guards";
import { getSkillBySlug } from "@/lib/db/skills";
import { getSkillReviews } from "@/lib/reviews/getSkillReviews";
import { getTurnstileSiteKey } from "@/lib/supabase/config";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildSkillReviewTitle } from "@/lib/seo/titleTemplates";

type ReviewPageProps = {
  params: Promise<{
    skillSlug: string;
  }>;
};

function readMetadataString(
  metadata: Record<string, unknown> | undefined,
  keys: string[],
) {
  for (const key of keys) {
    const value = metadata?.[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return null;
}

export async function generateMetadata({
  params,
}: ReviewPageProps): Promise<Metadata> {
  const { skillSlug } = await params;
  const skill = await getSkillBySlug(skillSlug);

  return buildPageMetadata({
    title: skill
      ? buildSkillReviewTitle(skill.name)
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
  const metadata = user.user_metadata as Record<string, unknown> | undefined;
  const reviewerIdentity = {
    avatarUrl:
      viewer.profile?.avatarUrl ??
      readMetadataString(metadata, ["avatar_url", "picture"]),
    displayName:
      viewer.profile?.displayName ??
      readMetadataString(metadata, ["display_name", "full_name", "name"]) ??
      viewer.profile?.username ??
      user.email?.split("@")[0] ??
      "SkillJury user",
    email: user.email ?? null,
    username: viewer.profile?.username ?? null,
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10 lg:px-10 lg:py-14">
      <section className="rounded-[2rem] border border-border bg-card/80 p-7 shadow-sm sm:p-8">
        <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
          Review submission
        </div>
        <h1 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">
          Write a review for {skill.name}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground">
          Keep the submission fast. The core verdict is required; deeper evidence stays
          inside the optional section if you want to add more context.
        </p>
      </section>

      {reviewBundle.viewerReview ? (
        <div className="rounded-[1.5rem] border border-amber-500/20 bg-amber-500/10 p-5 text-sm leading-7 text-amber-900 dark:text-amber-100">
          You have already submitted a review for this skill. Go back to the{" "}
          <Link
            className="font-medium text-foreground underline decoration-border underline-offset-4"
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
          reviewer={reviewerIdentity}
          skillName={skill.name}
          skillSlug={skill.slug}
          turnstileSiteKey={getTurnstileSiteKey()}
        />
      )}
    </div>
  );
}

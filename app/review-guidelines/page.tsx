import type { Metadata } from "next";

import { PolicyPageLayout } from "@/components/policies/PolicyPageLayout";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "What Counts as a Useful SkillJury Review?",
    description:
      "Review guidelines for SkillJury reviewers, including what to include, what gets removed, and how moderation works.",
    pathname: "/review-guidelines",
  });
}

export default function ReviewGuidelinesPage() {
  return (
    <PolicyPageLayout
      intro="SkillJury reviews should help the next person decide whether a skill is worth trying. The most useful reviews are specific about the task, the result, and the tradeoffs."
      sections={[
        {
          title: "What to include in a good review",
          body: [
            "Explain what you used the skill for, what worked well, and what still needs improvement. Short reviews are fine if they contain a real observation instead of generic praise.",
            "If you can, use the optional fields. Agent used, experience level, and proof-of-use details make the review more useful without forcing everyone into a long form.",
          ],
        },
        {
          title: "What gets removed or rejected",
          body: [
            "We remove spam, copy-paste reviews, harassment, and content that does not appear to come from real use. Reviews that only say a skill is 'good' or 'bad' without any concrete detail may also be rejected, especially from brand-new accounts.",
            "The first reviews from new accounts go into moderation so we can keep the public catalog trustworthy while the community is still growing.",
          ],
        },
        {
          title: "What not to do",
          body: [
            "Do not use SkillJury to attack maintainers, promote unrelated tools, or post affiliate-style hype. If you are connected to the maintainer or the source repo, say so clearly.",
            "If your issue is wrong metadata rather than a user experience problem, use the report flow instead of forcing it into a review.",
          ],
        },
      ]}
      title="What Counts as a Useful SkillJury Review?"
    />
  );
}

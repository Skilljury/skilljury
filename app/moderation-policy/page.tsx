import type { Metadata } from "next";

import { PolicyPageLayout } from "@/components/policies/PolicyPageLayout";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "How Does SkillJury Moderate Reviews and Reports?",
    description:
      "Read how SkillJury handles moderation, reports, appeals, and response expectations.",
    pathname: "/moderation-policy",
  });
}

export default function ModerationPolicyPage() {
  return (
    <PolicyPageLayout
      intro="SkillJury moderates new-user reviews, public reports, and skill submissions so the catalog can stay useful as it grows. The moderation goal is not to remove criticism. It is to remove low-trust noise."
      sections={[
        {
          title: "What enters moderation",
          body: [
            "The first reviews from a new account enter moderation automatically. Reports about skills or reviews also enter the moderation queue, as do new skill submissions from the public form.",
            "Moderators can approve, reject, or escalate items. Every moderation action is logged privately so we can review patterns and respond consistently.",
          ],
        },
        {
          title: "How fast moderation should feel",
          body: [
            "SkillJury is an early-stage public product, so moderation is not instant. The expectation is that clearly written submissions and reviews move faster than vague or suspicious ones.",
            "If an item is escalated, that usually means it needs a second look because it affects trust, safety, or the accuracy of the public catalog.",
          ],
        },
        {
          title: "Appeals and account actions",
          body: [
            "If an account is suspended or banned, the current appeal path is email-based. Contact the admin email listed on the login page and include the account email, the approximate action date, and a short explanation of why the decision should be reviewed.",
            "Serious abuse, spam, or repeated manipulation attempts can lead to immediate account limits or bans. Those changes are logged internally for audit and debugging purposes.",
          ],
        },
      ]}
      title="How Does SkillJury Moderate Reviews and Reports?"
    />
  );
}

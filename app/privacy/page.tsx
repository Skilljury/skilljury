import type { Metadata } from "next";

import { PolicyPageLayout } from "@/components/policies/PolicyPageLayout";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "SkillJury Privacy Policy",
    description:
      "Read what SkillJury stores, why it stores it, and how privacy is handled in the public review workflow.",
    pathname: "/privacy",
  });
}

export default function PrivacyPage() {
  return (
    <PolicyPageLayout
      intro="SkillJury stores the minimum account, review, moderation, and submission data needed to operate a public trust layer for AI agent skills."
      sections={[
        {
          title: "What data SkillJury stores",
          body: [
            "When you create an account, SkillJury stores your email-based account identifier plus the reviewer profile fields needed to show your public reviews. If you link GitHub, SkillJury also stores the GitHub username used as a trust signal.",
            "When you submit reviews, reports, or skill submissions, SkillJury stores the content you provide plus moderation and audit metadata needed to operate the queue safely.",
          ],
        },
        {
          title: "Why the data is used",
          body: [
            "The data is used to run the public catalog, prevent abuse, and keep moderation decisions traceable. Request-review clicks and other internal analytics helpers are used for product instrumentation, not for third-party ad targeting at this stage.",
            "SkillJury also stores imported public skill metadata from external sources and public repositories so the catalog can be searched and reviewed.",
          ],
        },
        {
          title: "What is public and what is private",
          body: [
            "Approved reviews and public catalog metadata are visible on the site. Moderation queue items, audit logs, and account-status actions are private.",
            "If you need a correction or removal request, use the contact path referenced in the moderation policy or the login page admin contact.",
          ],
        },
      ]}
      title="SkillJury Privacy Policy"
    />
  );
}

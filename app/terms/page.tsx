import type { Metadata } from "next";

import { PolicyPageLayout } from "@/components/policies/PolicyPageLayout";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "SkillJury Terms of Use",
    description:
      "Read the basic rules for using SkillJury, contributing reviews, and submitting skills to the public catalog.",
    pathname: "/terms",
  });
}

export default function TermsPage() {
  return (
    <PolicyPageLayout
      intro="By using SkillJury, you agree to contribute accurate information, avoid abuse, and respect that the site may moderate or remove content that undermines trust in the public catalog."
      sections={[
        {
          title: "Acceptable use",
          body: [
            "Do not use SkillJury to post spam, impersonate other people, manipulate ratings, or publish abusive content. Reviews and submissions should reflect real use, real repositories, and real public sources.",
            "If you submit a skill or a review, you are responsible for the accuracy of what you wrote and for any links you include.",
          ],
        },
        {
          title: "Catalog and review content",
          body: [
            "SkillJury aggregates public metadata from external sources and repositories. Those external sources remain the canonical origin for their own content. SkillJury may summarize, structure, and link back to them as part of the public catalog.",
            "SkillJury may edit or remove user-generated content when it violates the review guidelines, moderation policy, or safety requirements.",
          ],
        },
        {
          title: "No guarantee of ranking or publication",
          body: [
            "Submitting a skill or a review does not guarantee that it will be published immediately or at all. Moderation, trust scoring, and catalog ranking rules are designed to protect the usefulness of the platform.",
            "Sponsored placement, when introduced, must be labeled and cannot directly change organic ratings or unlabeled ranking surfaces.",
          ],
        },
      ]}
      title="SkillJury Terms of Use"
    />
  );
}

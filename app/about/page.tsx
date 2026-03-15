import type { Metadata } from "next";

import { PolicyPageLayout } from "@/components/policies/PolicyPageLayout";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "What Is SkillJury?",
    description:
      "Learn what SkillJury is, why it exists, and how it differs from install-count directories for AI agent skills.",
    pathname: "/about",
  });
}

export default function AboutPage() {
  return (
    <PolicyPageLayout
      intro="What is SkillJury? SkillJury is a public review and discovery layer for AI agent skills. It combines imported catalog data with structured user reviews, moderation, and trust signals so people can evaluate skills before installing them."
      sections={[
        {
          title: "Why SkillJury exists",
          body: [
            "Directories are useful for discovery, but install counts alone do not tell you whether a skill is well-documented, reliable, or worth using in a real workflow.",
            "SkillJury is built to fill that gap with reviews, confidence-adjusted ratings, report flows, and clear provenance back to the original source or repository.",
          ],
        },
        {
          title: "How SkillJury differs from directories",
          body: [
            "A directory like skills.sh is good at broad catalog coverage and install telemetry. SkillJury is trying to answer a different question: what do actual users think after they tried the skill?",
            "That is why the product emphasizes moderation, review quality, alternatives, and machine-readable summaries instead of acting like a raw mirror of source listings.",
          ],
        },
        {
          title: "How trust is handled",
          body: [
            "SkillJury uses real accounts with Google or email-and-password access, public reviewer IDs, optional GitHub linking, moderation queues, private audit logs, and clearly labeled sponsored placement rules. Paid placement must never change organic ratings or unlabeled ranking surfaces.",
            "The product is still early, but the intent is already clear: trust is the product, not a cosmetic feature added later.",
          ],
        },
      ]}
      title="What Is SkillJury?"
    />
  );
}

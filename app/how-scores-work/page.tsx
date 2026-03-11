import type { Metadata } from "next";

import { PolicyPageLayout } from "@/components/policies/PolicyPageLayout";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "How Are SkillJury Scores Calculated?",
    description:
      "Learn how SkillJury combines ratings, recommendation signals, and confidence adjustment into public skill scores.",
    pathname: "/how-scores-work",
  });
}

export default function HowScoresWorkPage() {
  return (
    <PolicyPageLayout
      intro="SkillJury scores are designed to reward useful reviews, not noisy spikes. We show the raw average, but we also adjust for low review counts so one early five-star review does not make a skill look finished."
      sections={[
        {
          title: "What the headline score means",
          body: [
            "The public headline score starts with the approved overall star ratings on a skill. We keep the five-star scale because it is familiar and easy to compare across skills.",
            "That raw average is then confidence-adjusted. Skills with many approved reviews stay close to their true average. Skills with only one or two reviews are pulled closer to the catalog baseline until more evidence arrives.",
          ],
        },
        {
          title: "What makes a score go up or down",
          body: [
            "A skill score goes up when more approved reviewers report strong outcomes and say they would recommend the skill. It goes down when later reviewers report weaker experiences or do not recommend it.",
            "Optional detail ratings such as setup quality or reliability do not override the headline score. They act as supporting context and only appear publicly after enough approved reviews include that field.",
          ],
        },
        {
          title: "Why some skills show low-confidence signals",
          body: [
            "If a skill has very few reviews, SkillJury makes that visible. The goal is to avoid fake certainty. Early reviews are still valuable, but they should not carry the same weight as a broader body of evidence.",
            "This is also why request-review counts matter. A skill with demand but no reviews is shown differently from a skill that already has a stable review history.",
          ],
        },
      ]}
      title="How Are SkillJury Scores Calculated?"
    />
  );
}

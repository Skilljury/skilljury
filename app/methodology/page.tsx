import type { Metadata } from "next";

import { PolicyPageLayout } from "@/components/policies/PolicyPageLayout";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "SkillJury Trust Methodology",
    description:
      "Learn what SkillJury's verified records, rankings, and security signals mean, what they do not guarantee, and how to reproduce the underlying evidence.",
    pathname: "/methodology",
  });
}

export default function MethodologyPage() {
  return (
    <PolicyPageLayout
      intro="SkillJury is designed to help people inspect AI agent skills before installation. Its labels and rankings summarize available evidence; they are not warranties, endorsements, or substitutes for reviewing the original repository and permissions yourself."
      sections={[
        {
          title: "What a verified record means",
          body: [
            "A verified record means SkillJury has matched the catalog entry to an identifiable public source and retained enough source metadata to make the listing traceable. It does not mean every line of code has been manually audited, that the maintainer is trustworthy, or that the skill is safe for every environment.",
            "During read-only recovery, the fully browsable verified set is a limited snapshot. Aggregate catalog counts describe snapshot coverage, not the number of records currently available for complete inspection.",
          ],
        },
        {
          title: "Rankings and popularity signals",
          body: [
            "Rankings are comparative discovery aids built from the available snapshot fields, such as observed installation activity and source metadata. They should not be interpreted as proof of quality, security, compatibility, or future maintenance.",
            "Popularity can be useful evidence of adoption, but it can also lag current repository conditions. Users should check the canonical source for recent releases, open issues, ownership changes, and installation instructions.",
          ],
        },
        {
          title: "Security signals and their limits",
          body: [
            "Security signals highlight observable risk factors and provenance evidence. A missing warning is not a clean bill of health, and a warning does not automatically prove malicious behavior.",
            "Before installing a skill, inspect the source repository, requested permissions, setup scripts, network access, secret handling, dependency changes, and any commands that can modify files or external systems. Use a restricted environment when the consequences are unclear.",
          ],
        },
        {
          title: "How to reproduce the evidence",
          body: [
            "Open the linked canonical source and compare its identity, repository path, documentation, release history, and installation instructions with the SkillJury record. Treat the source repository as authoritative when the two differ.",
            "For security-sensitive use, review the exact version or commit you plan to install rather than relying only on a catalog snapshot. Record the commit, inspect changes, and test with the minimum required permissions before wider use.",
          ],
        },
        {
          title: "Corrections and uncertainty",
          body: [
            "SkillJury should distinguish observed facts from inference and expose uncertainty rather than fill gaps with guesses. Records may become stale when upstream projects move, rename, change ownership, or remove content.",
            "Live reviews, submissions, sign-in, and catalog sync are temporarily unavailable during provider recovery. The methodology remains public so current labels can still be interpreted honestly while those systems are offline.",
          ],
        },
      ]}
      title="SkillJury Trust Methodology"
    />
  );
}

import type { BrowseAgent } from "@/lib/db/agents";

type AgentHeroProps = {
  agent: BrowseAgent;
};

function formatDate(value: string | null) {
  if (!value) {
    return "Unknown";
  }

  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function AgentHero({ agent }: AgentHeroProps) {
  return (
    <section className="rounded-[2rem] border border-border bg-card/80 p-7 shadow-sm">
      <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
        Agent compatibility
      </div>
      <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight text-foreground">
        Best {agent.name} skills by user reviews
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground">
        {agent.description ??
          "SkillJury groups these entries using the install distribution imported from skills.sh."}
      </p>
      {agent.reviewedSkillCount > 0 ? (
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
          {agent.highestRatedSkill?.overallScore
            ? `There are ${agent.reviewedSkillCount.toLocaleString("en-US")} reviewed skills compatible with ${agent.name}. The highest-rated is ${agent.highestRatedSkill.name} with ${agent.highestRatedSkill.overallScore.toFixed(2)}/5.`
            : `${agent.reviewedSkillCount.toLocaleString("en-US")} reviewed skills are currently compatible with ${agent.name}.`}
        </p>
      ) : null}
      <div className="mt-6 inline-flex rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground">
        {agent.skillCount.toLocaleString("en-US")} linked skills
      </div>
      <div className="mt-4 text-sm text-muted-foreground">
        Last updated: {formatDate(agent.lastUpdatedAt)}
      </div>
    </section>
  );
}

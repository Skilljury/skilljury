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
    <section className="rounded-xl border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,22,0.96),rgba(10,10,12,0.92))] p-7 text-white shadow-xl">
      <div className="text-xs uppercase tracking-[0.28em] text-zinc-500">
        Agent compatibility
      </div>
      <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight">
        Best {agent.name} skills by user reviews
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-8 text-zinc-400">
        {agent.description ??
          "SkillJury groups these entries using the install distribution imported from skills.sh."}
      </p>
      {agent.reviewedSkillCount > 0 ? (
        <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-300">
          {agent.highestRatedSkill?.overallScore
            ? `There are ${agent.reviewedSkillCount.toLocaleString("en-US")} reviewed skills compatible with ${agent.name}. The highest-rated is ${agent.highestRatedSkill.name} with ${agent.highestRatedSkill.overallScore.toFixed(2)}/5.`
            : `${agent.reviewedSkillCount.toLocaleString("en-US")} reviewed skills are currently compatible with ${agent.name}.`}
        </p>
      ) : null}
      <div className="mt-6 inline-flex rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm text-zinc-200">
        {agent.skillCount.toLocaleString("en-US")} linked skills
      </div>
      <div className="mt-4 text-sm text-zinc-500">
        Last updated: {formatDate(agent.lastUpdatedAt)}
      </div>
    </section>
  );
}

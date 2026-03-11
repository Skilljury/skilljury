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
    <section className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_32%),linear-gradient(135deg,#0f172a,#0b1020_55%,#172554)] p-7 text-white shadow-[0_35px_100px_rgba(0,0,0,0.35)]">
      <div className="text-xs uppercase tracking-[0.28em] text-slate-400">
        Agent compatibility
      </div>
      <h1 className="mt-4 font-display text-5xl tracking-tight">
        Best {agent.name} skills by user reviews
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
        {agent.description ??
          "SkillJury groups these entries using the install distribution imported from skills.sh."}
      </p>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200">
        {agent.reviewedSkillCount > 0 && agent.highestRatedSkill?.overallScore
          ? `There are ${agent.reviewedSkillCount.toLocaleString("en-US")} reviewed skills compatible with ${agent.name}. The highest-rated is ${agent.highestRatedSkill.name} with ${agent.highestRatedSkill.overallScore.toFixed(2)}/5.`
          : `There are ${agent.reviewedSkillCount.toLocaleString("en-US")} reviewed skills compatible with ${agent.name}. Live catalog activity is still doing most of the ranking work.`}
      </p>
      <div className="mt-6 inline-flex rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm text-slate-100">
        {agent.skillCount.toLocaleString("en-US")} linked skills
      </div>
      <div className="mt-4 text-sm text-slate-300">
        Last updated: {formatDate(agent.lastUpdatedAt)}
      </div>
    </section>
  );
}

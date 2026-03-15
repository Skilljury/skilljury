import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Binary,
  Blocks,
  Bot,
  BrainCircuit,
  Braces,
  Cloud,
  Code2,
  Cpu,
  GitBranch,
  Hammer,
  Shield,
  Sparkles,
  Terminal,
  Wind,
} from "lucide-react";

type AgentRailProps = {
  agents: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
};

const iconMap: Array<{ icon: LucideIcon; match: (slug: string) => boolean }> = [
  { icon: Terminal, match: (slug) => slug.includes("claude") || slug.includes("codex") },
  { icon: Code2, match: (slug) => slug.includes("cursor") || slug.includes("code") },
  { icon: Wind, match: (slug) => slug.includes("windsurf") },
  { icon: Sparkles, match: (slug) => slug.includes("gemini") || slug.includes("openai") },
  { icon: BrainCircuit, match: (slug) => slug.includes("chatgpt") || slug.includes("copilot") },
  { icon: Blocks, match: (slug) => slug.includes("mcp") || slug.includes("plugin") },
  { icon: Shield, match: (slug) => slug.includes("security") },
  { icon: Cloud, match: (slug) => slug.includes("azure") || slug.includes("cloud") },
  { icon: Hammer, match: (slug) => slug.includes("builder") || slug.includes("forge") },
  { icon: Binary, match: (slug) => slug.includes("cli") || slug.includes("terminal") },
  { icon: GitBranch, match: (slug) => slug.includes("github") || slug.includes("git") },
  { icon: Cpu, match: (slug) => slug.includes("agent") || slug.includes("ai") },
  { icon: Braces, match: (slug) => slug.includes("dev") || slug.includes("sdk") },
];

function getAgentIcon(slug: string): LucideIcon {
  const match = iconMap.find((entry) => entry.match(slug));
  return match?.icon ?? Bot;
}

export function AgentRail({ agents }: AgentRailProps) {
  if (agents.length === 0) {
    return null;
  }

  return (
    <div className="scrollbar-hide overflow-x-auto pb-2">
      <div className="flex min-w-max gap-3">
        {agents.map((agent) => {
          const Icon = getAgentIcon(agent.slug);

          return (
            <Link
              className="glass-agent skill-card-glow inline-flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-3"
              href={`/agents/${agent.slug}`}
              key={agent.id}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-white/12 via-white/4 to-transparent">
                <Icon className="h-3.5 w-3.5 text-zinc-200" />
              </div>
              <span className="whitespace-nowrap text-sm uppercase tracking-[0.18em] text-foreground">
                {agent.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

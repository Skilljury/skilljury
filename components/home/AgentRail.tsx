import Link from "next/link";

type AgentRailProps = {
  agents: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
};

const VISIBLE_COUNT = 10;

export function AgentRail({ agents }: AgentRailProps) {
  if (agents.length === 0) {
    return null;
  }

  const visible = agents.slice(0, VISIBLE_COUNT);
  const remaining = agents.length - VISIBLE_COUNT;

  return (
    <section className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {visible.map((agent, index) => (
          <Link
            className="group rounded-2xl border border-border/80 bg-card/60 px-4 py-4 transition-default hover:border-primary/30 hover:bg-surface-hover"
            href={`/agents/${agent.slug}`}
            key={agent.id}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  Agent {String(index + 1).padStart(2, "0")}
                </div>
                <div className="mt-2 truncate text-sm text-foreground">
                  {agent.name}
                </div>
              </div>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/80 text-[10px] text-muted-foreground transition-default group-hover:border-primary/30 group-hover:text-foreground">
                →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {remaining > 0 ? (
        <div className="text-right">
          <Link
            className="text-sm text-muted-foreground transition-default hover:text-foreground hover:underline underline-offset-4"
            href="/search"
          >
            + {remaining} more agents
          </Link>
        </div>
      ) : null}
    </section>
  );
}

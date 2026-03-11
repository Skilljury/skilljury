import { Badge } from "@/components/ui/Badge";

type HeroProps = {
  liveSkillCount: number;
  liveSourceCount: number;
};

export function Hero({ liveSkillCount, liveSourceCount }: HeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(247,212,138,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.22),transparent_30%),linear-gradient(135deg,#0f172a,#050816_65%)] px-6 py-10 shadow-[0_45px_120px_rgba(0,0,0,0.45)] lg:px-10 lg:py-14">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:26px_26px] opacity-35" />
      <div className="relative grid gap-10 lg:grid-cols-[1.3fr_0.8fr]">
        <div className="space-y-6">
          <Badge tone="accent">4,000+ AI Skills Reviewed</Badge>
          <div className="space-y-4">
            <h1 className="max-w-4xl font-display text-5xl leading-[0.94] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Judge AI agent skills before you install them.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-300">
              Browse real user reviews, compare ratings, and find the best AI
              agent skills for your workflow - backed by community trust signals
              and transparent scoring.
            </p>
          </div>
        </div>

        <div className="grid gap-4 self-end">
          <div className="rounded-[1.75rem] border border-white/12 bg-white/6 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Live skill count
            </div>
            <div className="mt-3 font-mono text-4xl font-semibold text-white">
              {liveSkillCount.toLocaleString("en-US")}
            </div>
          </div>
          <div className="rounded-[1.75rem] border border-white/12 bg-white/6 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Active sources
            </div>
            <div className="mt-3 font-mono text-4xl font-semibold text-white">
              {liveSourceCount.toLocaleString("en-US")}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

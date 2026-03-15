import Link from "next/link";

import { Badge } from "@/components/ui/Badge";

type HeroProps = {
  liveSkillCount: number;
  liveSourceCount: number;
};

export function Hero({ liveSkillCount, liveSourceCount }: HeroProps) {
  return (
    <section className="relative overflow-hidden rounded-xl border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,22,0.96),rgba(10,10,12,0.92))] px-6 py-14 shadow-xl lg:px-10 lg:py-18">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_34%),linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:auto,28px_28px,28px_28px] opacity-35" />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center space-y-8 text-center">
        <Badge tone="accent">Trust-first AI skill discovery</Badge>
        <div className="space-y-5">
          <h1 className="font-display text-5xl font-semibold leading-[0.94] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
            Judge AI agent skills before you install them.
          </h1>
          <p className="mx-auto max-w-3xl text-lg leading-8 text-zinc-400">
            SkillJury is a live directory of AI agent skills with public reviews,
            install context, source repositories, and compatibility pages, so you
            can browse the catalog with a clearer sense of quality, trust, and fit.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            className="rounded-lg bg-white px-6 py-3 text-sm font-medium text-zinc-950 transition hover:bg-zinc-100"
            href="/search"
          >
            Browse skills
          </Link>
          <Link
            className="rounded-lg border border-white/10 px-6 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/6"
            href="/submit-skill"
          >
            Submit a skill
          </Link>
        </div>

        <div className="grid w-full gap-4 border-t border-white/10 pt-8 sm:grid-cols-3">
          <div className="rounded-lg border border-white/8 bg-white/[0.03] p-5 text-left">
            <div className="text-xs uppercase tracking-[0.28em] text-zinc-500">
              Skills indexed
            </div>
            <div className="mt-3 font-mono text-4xl font-semibold text-white">
              {liveSkillCount.toLocaleString("en-US")}
            </div>
          </div>
          <div className="rounded-lg border border-white/8 bg-white/[0.03] p-5 text-left">
            <div className="text-xs uppercase tracking-[0.28em] text-zinc-500">
              Sources tracked
            </div>
            <div className="mt-3 font-mono text-4xl font-semibold text-white">
              {liveSourceCount.toLocaleString("en-US")}
            </div>
          </div>
          <div className="rounded-lg border border-white/8 bg-white/[0.03] p-5 text-left">
            <div className="text-xs uppercase tracking-[0.28em] text-zinc-500">
              Public review flow
            </div>
            <div className="mt-3 text-lg font-medium text-white">
              Reviews, moderation, and submissions are already wired into the
              live app.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

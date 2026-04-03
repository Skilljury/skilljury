import Link from "next/link";

import { Badge } from "@/components/ui/Badge";

type HeroProps = {
  liveSkillCount: number;
  liveSourceCount: number;
};

export function Hero({ liveSkillCount, liveSourceCount }: HeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card/85 px-6 py-14 shadow-sm lg:px-10 lg:py-18">
      <div className="relative mx-auto flex max-w-4xl flex-col items-center space-y-8 text-center">
        <Badge tone="accent">Trust-first AI skill discovery</Badge>
        <div className="space-y-5">
          <h1 className="font-display text-5xl font-semibold leading-[0.94] tracking-[-0.04em] text-foreground sm:text-6xl lg:text-7xl">
            Judge AI agent skills before you install them.
          </h1>
          <p className="mx-auto max-w-3xl text-lg leading-8 text-muted-foreground">
            SkillJury is a live directory of AI agent skills with public reviews,
            install context, source repositories, and compatibility pages, so you
            can browse the catalog with a clearer sense of quality, trust, and fit.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-95"
            href="/search"
          >
            Browse skills
          </Link>
          <Link
            className="rounded-full border border-border bg-background px-6 py-3 text-sm font-medium text-foreground transition hover:border-primary/20 hover:bg-card"
            href="/submit-skill"
          >
            Submit a skill
          </Link>
        </div>

        <div className="grid w-full gap-4 border-t border-border pt-8 sm:grid-cols-3">
          <div className="rounded-[1.5rem] border border-border bg-background p-5 text-left">
            <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
              Skills indexed
            </div>
            <div className="mt-3 font-mono text-4xl font-semibold text-foreground">
              {liveSkillCount.toLocaleString("en-US")}
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-border bg-background p-5 text-left">
            <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
              Sources tracked
            </div>
            <div className="mt-3 font-mono text-4xl font-semibold text-foreground">
              {liveSourceCount.toLocaleString("en-US")}
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-border bg-background p-5 text-left">
            <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
              Public review flow
            </div>
            <div className="mt-3 text-lg font-medium text-foreground">
              Reviews, moderation, and submissions are already wired into the
              live app.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

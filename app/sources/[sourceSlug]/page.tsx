import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { UnavailableSnapshotRecord } from "@/components/recovery/UnavailableSnapshotRecord";
import {
  EMERGENCY_CATALOG_SNAPSHOT_AT,
  EMERGENCY_LEADERBOARD,
} from "@/lib/data/emergencyCatalog";
import { decodeSourceSlug } from "@/lib/routing/sourceSlug";

type SourcePageProps = { params: Promise<{ sourceSlug: string }> };

export const metadata: Metadata = {
  title: "Source recovery snapshot | SkillJury",
  description: "Read-only AI skill source details from SkillJury's verified recovery snapshot.",
  robots: { index: false, follow: true },
};

function getSourceSkills(sourceSlug: string) {
  return EMERGENCY_LEADERBOARD.filter((skill) => skill.source.slug === sourceSlug);
}

async function SourceContent({ params }: SourcePageProps) {
  const { sourceSlug } = await params;
  const decodedSlug = decodeSourceSlug(sourceSlug);
  const skills = getSourceSkills(decodedSlug);
  if (skills.length === 0) return <div className="mx-auto flex w-full max-w-6xl flex-col gap-8"><UnavailableSnapshotRecord kind="source" requestedLabel={decodedSlug} /></div>;

  const source = skills[0].source;
  const snapshotDate = new Date(EMERGENCY_CATALOG_SNAPSHOT_AT).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });

  return <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
    <Link className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground" href="/search"><span aria-hidden="true">←</span>Back to snapshot search</Link>
    <section className="rounded-[2rem] border border-border bg-card/80 p-7 shadow-sm sm:p-9">
      <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-amber-200">Verified snapshot source</div>
      <h1 className="font-display mt-6 break-words text-balance text-4xl tracking-[-0.04em] text-foreground sm:text-6xl">{source.name}</h1>
      <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground">{skills.length.toLocaleString("en-US")} top-ranked skill{skills.length === 1 ? "" : "s"} from this source are visible in the emergency snapshot captured {snapshotDate}. The complete source listing will return when live provider access is restored.</p>
    </section>
    <section className="space-y-5">
      <div><div className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Visible skills</div><h2 className="font-display mt-3 text-3xl tracking-[-0.04em] text-foreground">Recovery catalog entries</h2></div>
      <div className="overflow-hidden rounded-2xl border border-border bg-card/80">{skills.map((skill) => <Link className="grid gap-2 border-b border-border/60 px-5 py-5 last:border-0 hover:bg-surface-hover sm:grid-cols-[minmax(0,1fr)_120px] sm:items-center" href={`/skills/${skill.slug}`} key={skill.id}><span className="min-w-0"><span className="block truncate text-base font-medium text-foreground">{skill.name}</span><span className="mt-1 block text-sm text-muted-foreground">General audit: {skill.securityAudits.gen}; Snyk: {skill.securityAudits.snyk}; Socket: {skill.securityAudits.socket}</span></span><span className="text-sm text-muted-foreground sm:text-right">{skill.weeklyInstalls.toLocaleString("en-US")}/week</span></Link>)}</div>
    </section>
  </div>;
}

function SourceSkeleton() { return <div className="mx-auto flex w-full max-w-6xl flex-col gap-8"><div className="space-y-6"><div className="h-5 w-40 animate-pulse rounded bg-muted/30" /><div className="h-80 animate-pulse rounded-[2rem] bg-muted/30" /></div></div>; }

export default function SourcePage({ params }: SourcePageProps) { return <Suspense fallback={<SourceSkeleton />}><SourceContent params={params} /></Suspense>; }

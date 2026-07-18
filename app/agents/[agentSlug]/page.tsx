import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import {
  EMERGENCY_AGENT_RAIL,
  EMERGENCY_CATALOG_SNAPSHOT_AT,
} from "@/lib/data/emergencyCatalog";
import { buildPageMetadata } from "@/lib/seo/metadata";

type AgentPageProps = {
  params: Promise<{ agentSlug: string }>;
};

export async function generateMetadata({ params }: AgentPageProps): Promise<Metadata> {
  const { agentSlug } = await params;
  const agent = EMERGENCY_AGENT_RAIL.find((item) => item.slug === agentSlug);

  if (!agent) {
    return buildPageMetadata({
      title: "Agent unavailable in recovery snapshot | SkillJury",
      description:
        "This agent is not included in SkillJury's temporary recovery snapshot.",
      indexable: false,
      pathname: `/agents/${agentSlug}`,
    });
  }

  return buildPageMetadata({
    title: `${agent.name} AI skills | SkillJury`,
    description: `Browse the ${agent.name} compatibility area in SkillJury's verified recovery snapshot.`,
    pathname: `/agents/${agent.slug}`,
  });
}

async function AgentContent({ params }: AgentPageProps) {
  const { agentSlug } = await params;
  const agent = EMERGENCY_AGENT_RAIL.find((item) => item.slug === agentSlug);

  if (!agent) {
    notFound();
  }

  const snapshotDate = new Date(EMERGENCY_CATALOG_SNAPSHOT_AT).toLocaleString(
    "en-US",
    { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" },
  );

  return (
    <>
      <Link
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        href="/"
      >
        <span aria-hidden="true">←</span>
        Back to recovery catalog
      </Link>

      <section className="rounded-[2rem] border border-border bg-card/80 p-7 shadow-sm sm:p-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-amber-200">
          Verified snapshot agent
        </div>
        <h1 className="font-display mt-6 text-balance text-4xl tracking-[-0.04em] text-foreground sm:text-6xl">
          {agent.name}
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground">
          {agent.name} is present in SkillJury&apos;s recovery snapshot captured {snapshotDate}. Live compatibility filtering is temporarily unavailable because Supabase API access is restricted.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            className="rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-95"
            href="/search"
          >
            Browse visible skills
          </Link>
          <Link
            className="rounded-full border border-border px-5 py-3 text-sm text-foreground hover:border-primary/30"
            href="/"
          >
            View all snapshot agents
          </Link>
        </div>
      </section>
    </>
  );
}

function AgentSkeleton() {
  return <div className="h-80 animate-pulse rounded-[2rem] bg-muted/30" />;
}

export default function AgentPage({ params }: AgentPageProps) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <Suspense fallback={<AgentSkeleton />}>
        <AgentContent params={params} />
      </Suspense>
    </div>
  );
}

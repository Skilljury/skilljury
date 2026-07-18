import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  EMERGENCY_CATALOG_SNAPSHOT_AT,
  EMERGENCY_LEADERBOARD,
} from "@/lib/data/emergencyCatalog";
import { encodeSourceSlug } from "@/lib/routing/sourceSlug";
import { buildPageMetadata } from "@/lib/seo/metadata";

type SkillPageProps = {
  params: Promise<{ skillSlug: string }>;
};

export async function generateMetadata({ params }: SkillPageProps): Promise<Metadata> {
  const { skillSlug } = await params;
  const skill = EMERGENCY_LEADERBOARD.find((item) => item.slug === skillSlug);

  if (!skill) {
    return buildPageMetadata({
      title: "Skill unavailable in recovery snapshot | SkillJury",
      description:
        "This skill is not included in SkillJury's temporary recovery snapshot.",
      indexable: false,
      pathname: `/skills/${skillSlug}`,
    });
  }

  return buildPageMetadata({
    title: `${skill.name} security signals and installs | SkillJury`,
    description: `${skill.name} has ${skill.weeklyInstalls.toLocaleString("en-US")} weekly installs in SkillJury's verified recovery snapshot, with available security audit signals.`,
    pathname: `/skills/${skill.slug}`,
  });
}

export default async function SkillPage({ params }: SkillPageProps) {
  const { skillSlug } = await params;
  const skill = EMERGENCY_LEADERBOARD.find((item) => item.slug === skillSlug);

  if (!skill) {
    notFound();
  }

  const snapshotDate = new Date(EMERGENCY_CATALOG_SNAPSHOT_AT).toLocaleString(
    "en-US",
    { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" },
  );
  const audits = [
    { label: "General", value: skill.securityAudits.gen },
    { label: "Snyk", value: skill.securityAudits.snyk },
    { label: "Socket", value: skill.securityAudits.socket },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <Link
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        href="/search"
      >
        <span aria-hidden="true">←</span>
        Back to snapshot search
      </Link>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.75fr)]">
        <div className="rounded-[2rem] border border-border bg-card/80 p-7 shadow-sm sm:p-9">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-amber-200">
            Verified snapshot
          </div>
          <p className="mt-6 text-sm text-muted-foreground">{skill.source.name}</p>
          <h1 className="font-display mt-3 text-balance text-4xl tracking-[-0.04em] text-foreground sm:text-6xl">
            {skill.name}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
            This read-only record was captured directly from SkillJury&apos;s PostgreSQL database while the Supabase API is restricted. Community reviews and live compatibility details are temporarily unavailable.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Fact label="Weekly installs" value={skill.weeklyInstalls.toLocaleString("en-US")} />
            <Fact label="Snapshot date" value={snapshotDate} />
            <Fact label="Record ID" value={skill.id.toLocaleString("en-US")} />
          </div>
        </div>

        <aside className="space-y-5">
          <section className="rounded-[1.5rem] border border-border bg-card/80 p-6">
            <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              Security audit signals
            </div>
            <div className="mt-5 space-y-3">
              {audits.map((audit) => (
                <div
                  className="flex items-center justify-between gap-4 rounded-xl border border-border/70 bg-background/50 px-4 py-3"
                  key={audit.label}
                >
                  <span className="text-sm text-muted-foreground">{audit.label}</span>
                  <span className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-[0.14em] text-foreground">
                    {audit.value}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-6 text-muted-foreground">
              Last audit snapshot: {new Date(skill.securityAudits.scraped_at).toLocaleDateString("en-US", { dateStyle: "medium" })}.
            </p>
          </section>

          <section className="rounded-[1.5rem] border border-border bg-card/80 p-6">
            <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              Source
            </div>
            <p className="mt-4 break-words text-sm text-foreground">{skill.source.name}</p>
            <Link
              className="mt-5 inline-flex text-sm text-primary hover:underline"
              href={`/sources/${encodeSourceSlug(skill.source.slug)}`}
            >
              Browse visible source skills
            </Link>
          </section>
        </aside>
      </section>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/50 p-4">
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-2 text-sm leading-6 text-foreground">{value}</div>
    </div>
  );
}

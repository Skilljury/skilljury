import type { Metadata } from "next";
import Link from "next/link";

import {
  EMERGENCY_CATALOG_SNAPSHOT_AT,
  EMERGENCY_LEADERBOARD,
} from "@/lib/data/emergencyCatalog";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildListingMetadataText } from "@/lib/seo/titleTemplates";

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = buildListingMetadataText("new");

  return buildPageMetadata({
    title,
    description,
    pathname: "/new",
  });
}

function formatSnapshotDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

const snapshotSkills = [...EMERGENCY_LEADERBOARD].sort((a, b) => {
  const createdAtDifference =
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

  return createdAtDifference || b.weeklyInstalls - a.weeklyInstalls;
});

export default function NewPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 lg:px-10 lg:py-14">
      <section className="rounded-[2rem] border border-border bg-card/80 p-7 shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-amber-200">
          <span className="h-2 w-2 rounded-full bg-amber-300" />
          Verified snapshot mode
        </div>
        <h1 className="mt-5 text-5xl font-semibold tracking-tight text-foreground">
          New skills
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground">
          Recently imported skills from SkillJury&apos;s verified recovery snapshot.
          Live first-seen ordering will resume when catalog sync is restored.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Snapshot generated {formatSnapshotDate(EMERGENCY_CATALOG_SNAPSHOT_AT)}.
        </p>
      </section>

      <section
        aria-label="New skills recovery catalog"
        className="overflow-hidden rounded-[1.5rem] border border-border bg-card/80"
      >
        {snapshotSkills.map((skill) => (
          <Link
            key={skill.id}
            href={`/skills/${skill.slug}`}
            className="grid grid-cols-[minmax(0,1fr)_110px] items-center gap-3 border-b border-border/60 px-4 py-4 last:border-0 hover:bg-surface-hover sm:px-6"
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-foreground">
                {skill.name}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {skill.source.name}
              </span>
            </span>
            <span className="text-right text-xs text-muted-foreground">
              {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
                new Date(skill.createdAt),
              )}
            </span>
          </Link>
        ))}
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/search"
          className="inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-default hover:bg-primary/90"
        >
          Search the snapshot
        </Link>
        <Link
          href="/"
          className="inline-flex rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground transition-default hover:bg-surface-hover"
        >
          Back to catalog
        </Link>
      </div>
    </div>
  );
}

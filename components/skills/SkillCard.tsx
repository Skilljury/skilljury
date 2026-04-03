import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import type { SkillListItem } from "@/lib/db/skills";

type SkillCardProps = {
  skill: SkillListItem;
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

function formatCompactNumber(value: number | null) {
  if (!value) {
    return null;
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: value >= 1000 ? 1 : 0,
    notation: value >= 1000 ? "compact" : "standard",
  }).format(value);
}

export function SkillCard({ skill }: SkillCardProps) {
  const hasPublishedReviews =
    skill.overallScore !== null && skill.approvedReviewCount > 0;
  const installCount = formatCompactNumber(skill.weeklyInstalls);
  const firstSeenLabel = formatDate(skill.firstSeenAt);
  const lastSyncedLabel = formatDate(skill.lastSyncedAt);
  const primaryCategories = skill.categories.slice(0, 2);

  return (
    <Link
      aria-label={`${skill.name} - view details`}
      className="block rounded-2xl border border-border bg-surface-elevated/55 px-4 py-4 skill-card-glow transition-default hover:border-primary/20 hover:bg-surface-hover/70 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
      href={`/skills/${skill.slug}`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            <span>{skill.source?.name ?? "Imported source"}</span>
            {skill.categories[0]?.name ? (
              <>
                <span className="text-border">/</span>
                <span>{skill.categories[0].name}</span>
              </>
            ) : null}
          </div>
          <h3 className="mt-2 text-[1.05rem] font-semibold leading-snug tracking-[-0.02em] text-foreground">
            {skill.name}
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
            {skill.shortSummary ??
              "Source details, install context, and public review data are available on the full page."}
          </p>
        </div>

        <div className="grid shrink-0 gap-3 sm:grid-cols-2 lg:min-w-[16rem] lg:grid-cols-1">
          <div className="rounded-xl border border-border bg-background/60 px-3 py-3">
            <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              Weekly installs
            </div>
            <div className="mt-2 font-mono text-sm text-foreground">
              {installCount ?? "0"}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-background/60 px-3 py-3">
            <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              Freshness
            </div>
            <div className="mt-2 text-sm text-foreground">
              {lastSyncedLabel !== "Unknown" ? `Synced ${lastSyncedLabel}` : "Unknown"}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {primaryCategories.map((category) => (
          <Badge key={category.id} tone="muted">
            {category.name}
          </Badge>
        ))}
        {hasPublishedReviews ? (
          <span className="rounded-full border border-border bg-secondary px-3 py-1 text-[10px] font-mono uppercase tracking-[0.24em] text-foreground">
            {skill.overallScore?.toFixed(1)}/5 - {skill.approvedReviewCount} reviews
          </span>
        ) : (
          <span className="rounded-full border border-border bg-secondary px-3 py-1 text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
            No reviews yet
          </span>
        )}
        {firstSeenLabel !== "Unknown" ? (
          <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
            First seen {firstSeenLabel}
          </span>
        ) : null}
        {skill.source ? (
          <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
            Source {skill.source.name}
          </span>
        ) : null}
      </div>
    </Link>
  );
}

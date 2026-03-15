import Link from "next/link";

import type { SkillListItem } from "@/lib/db/skills";
import { Badge } from "@/components/ui/Badge";

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
  const agentLikeSignals = [
    skill.categories[0]?.name,
    skill.categories[1]?.name,
  ].filter(Boolean) as string[];

  return (
    <Link
      className="block rounded-lg border border-border bg-surface-elevated/50 p-4 skill-card-glow transition-default"
      href={`/skills/${skill.slug}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-foreground">{skill.name}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            by {skill.source?.name ?? "Imported source"}
          </p>
        </div>
        {installCount ? (
          <span className="font-mono text-xs text-muted-foreground">
            {installCount}
          </span>
        ) : null}
      </div>

      <p className="mb-3 mt-3 line-clamp-2 text-sm text-foreground/80">
        {skill.shortSummary ??
          "Source details, install context, and public review data are available on the full page."}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {agentLikeSignals.map((label) => (
          <Badge key={label} tone="muted">
            {label}
          </Badge>
        ))}
        {hasPublishedReviews ? (
          <span className="rounded bg-secondary px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-foreground">
            {skill.overallScore?.toFixed(1)}/5 · {skill.approvedReviewCount} reviews
          </span>
        ) : null}
        {firstSeenLabel !== "Unknown" ? (
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            First seen {firstSeenLabel}
          </span>
        ) : null}
      </div>
    </Link>
  );
}

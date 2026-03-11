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

export function SkillCard({ skill }: SkillCardProps) {
  return (
    <Link
      className="group flex h-full flex-col justify-between rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_22px_60px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_28px_70px_rgba(15,23,42,0.14)]"
      href={`/skills/${skill.slug}`}
    >
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.26em] text-slate-500">
              {skill.source?.name ?? "Imported source"}
            </div>
            <h2 className="mt-3 font-display text-3xl leading-tight tracking-tight text-slate-950">
              {skill.name}
            </h2>
          </div>
          {skill.categories[0] ? (
            <Badge tone="muted">{skill.categories[0].name}</Badge>
          ) : null}
        </div>

        <p className="line-clamp-4 text-sm leading-7 text-slate-600">
          {skill.shortSummary ??
            "No summary available yet. Click to explore details and reviews."}
        </p>
      </div>

      <div className="mt-8 grid gap-4 border-t border-slate-200 pt-5 text-sm text-slate-600 sm:grid-cols-2">
        <div>
          <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
            Rating
          </div>
          <div className="mt-2 font-mono text-xl font-semibold text-slate-950">
            {skill.overallScore ? `${skill.overallScore.toFixed(2)}/5` : "Pending"}
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
            Reviews
          </div>
          <div className="mt-2 font-mono text-sm text-slate-950">
            {skill.approvedReviewCount.toLocaleString("en-US")}
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
            Weekly installs
          </div>
          <div className="mt-2 font-mono text-xl font-semibold text-slate-950">
            {(skill.weeklyInstalls ?? 0).toLocaleString("en-US")}
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
            Last updated
          </div>
          <div className="mt-2 font-mono text-sm text-slate-950">
            {formatDate(skill.lastSyncedAt ?? skill.firstSeenAt)}
          </div>
        </div>
      </div>
    </Link>
  );
}

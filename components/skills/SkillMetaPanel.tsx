import type { SkillDetail } from "@/lib/db/skills";
import type { ReviewAggregateSummary } from "@/lib/reviews/aggregateRatings";

import { ReportDialog } from "@/components/reports/ReportDialog";

type SkillMetaPanelProps = {
  canReport: boolean;
  lastUpdatedAt: string | null;
  reportLoginHref: string;
  requestCount: number;
  reviewSummary: ReviewAggregateSummary;
  skill: SkillDetail;
  turnstileSiteKey: string;
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

export function SkillMetaPanel({
  canReport,
  lastUpdatedAt,
  reportLoginHref,
  requestCount,
  reviewSummary,
  skill,
  turnstileSiteKey,
}: SkillMetaPanelProps) {
  return (
    <aside className="space-y-5">
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
        <div className="grid gap-5">
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
              Overall rating
            </div>
            <div className="mt-2 font-mono text-3xl font-semibold text-slate-950">
              {reviewSummary.overallAverage
                ? `${reviewSummary.overallAverage.toFixed(2)}/5`
                : "Pending"}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
              Public reviews
            </div>
            <div className="mt-2 font-mono text-sm text-slate-950">
              {reviewSummary.approvedCount.toLocaleString("en-US")}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
              Weekly installs
            </div>
            <div className="mt-2 font-mono text-3xl font-semibold text-slate-950">
              {(skill.weeklyInstalls ?? 0).toLocaleString("en-US")}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
              Last updated
            </div>
            <div className="mt-2 font-mono text-sm text-slate-950">
              {formatDate(lastUpdatedAt)}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
              First seen
            </div>
            <div className="mt-2 font-mono text-sm text-slate-950">
              {formatDate(skill.firstSeenAt)}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
              Repository
            </div>
            <div className="mt-2 text-sm text-slate-700">
              {skill.repository?.repositoryUrl ? (
                <a
                  className="break-all text-slate-950 underline decoration-slate-300 underline-offset-4"
                  href={skill.repository.repositoryUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  {skill.repository.ownerName}/{skill.repository.repositoryName}
                </a>
              ) : (
                "Repository metadata unavailable"
              )}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
              GitHub stars
            </div>
            <div className="mt-2 font-mono text-sm text-slate-950">
              {(skill.repository?.stars ?? 0).toLocaleString("en-US")}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
              Canonical source
            </div>
            <a
              className="mt-2 block break-all text-sm text-slate-950 underline decoration-slate-300 underline-offset-4"
              href={skill.canonicalSourceUrl}
              rel="noreferrer"
              target="_blank"
            >
              {skill.canonicalSourceUrl}
            </a>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
              Would recommend
            </div>
            <div className="mt-2 font-mono text-sm text-slate-950">
              {reviewSummary.recommendationPercentage !== null
                ? `${reviewSummary.recommendationPercentage}%`
                : "Pending"}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
              Review requests
            </div>
            <div className="mt-2 font-mono text-sm text-slate-950">
              {requestCount.toLocaleString("en-US")}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
        <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
          Installed on
        </div>
        {skill.agentInstallData.length > 0 ? (
          <div className="mt-4 space-y-3">
            {skill.agentInstallData.map((agent) => (
              <div
                key={`${agent.agentSlug}-${agent.installCount}`}
                className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3"
              >
                <span className="text-sm font-medium text-slate-900">
                  {agent.agentName}
                </span>
                <span className="font-mono text-sm text-slate-600">
                  {agent.installCount.toLocaleString("en-US")}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Agent install distribution is not available yet for this skill.
          </p>
        )}
      </div>

      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
        <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
          Report listing
        </div>
        <div className="mt-4 text-sm leading-7 text-slate-600">
          Flag wrong metadata, spam, or copyright issues if the public listing needs a moderator review.
        </div>
        <div className="mt-4">
          <ReportDialog
            isSignedIn={canReport}
            loginHref={reportLoginHref}
            targetId={String(skill.id)}
            targetLabel="listing"
            targetType="skill"
            turnstileSiteKey={turnstileSiteKey}
          />
        </div>
      </div>
    </aside>
  );
}

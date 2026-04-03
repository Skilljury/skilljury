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

function metricValueClass(hasNumericValue: boolean) {
  return hasNumericValue
    ? "mt-2 font-mono text-3xl font-semibold text-foreground"
    : "mt-2 text-sm leading-7 text-muted-foreground";
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
      <div className="rounded-[1.75rem] border border-border bg-card/80 p-6 shadow-sm">
        <div className="grid gap-5">
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              SkillJury rating
            </div>
            <div
              className={metricValueClass(
                reviewSummary.overallAverage !== null,
              )}
            >
              {reviewSummary.overallAverage
                ? `${reviewSummary.overallAverage.toFixed(2)}/5`
                : "Not reviewed yet"}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              Public reviews
            </div>
            <div
              className={`mt-2 font-mono text-sm ${
                reviewSummary.approvedCount > 0 ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {reviewSummary.approvedCount.toLocaleString("en-US")}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              Weekly installs
            </div>
            <div className={metricValueClass(true)}>
              {(skill.weeklyInstalls ?? 0).toLocaleString("en-US")}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              Last updated
            </div>
            <div className="mt-2 font-mono text-sm text-foreground">
              {formatDate(lastUpdatedAt)}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              First seen
            </div>
            <div className="mt-2 font-mono text-sm text-foreground">
              {formatDate(skill.firstSeenAt)}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              Repository
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              {skill.repository?.repositoryUrl ? (
                <a
                  className="break-all text-foreground underline decoration-border underline-offset-4"
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
            <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              GitHub stars
            </div>
            <div className="mt-2 font-mono text-sm text-foreground">
              {(skill.repository?.stars ?? 0).toLocaleString("en-US")}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              Canonical source
            </div>
            {skill.canonicalSourceUrl ? (
              <a
                className="mt-2 block break-all text-sm text-foreground underline decoration-border underline-offset-4"
                href={skill.canonicalSourceUrl}
                rel="noreferrer"
                target="_blank"
              >
                {skill.canonicalSourceUrl}
              </a>
            ) : (
              <div className="mt-2 text-sm leading-7 text-muted-foreground">
                Canonical source unavailable
              </div>
            )}
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              Would recommend
            </div>
            <div
              className={`mt-2 font-mono text-sm ${
                reviewSummary.recommendationPercentage !== null
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {reviewSummary.recommendationPercentage !== null
                ? `${reviewSummary.recommendationPercentage}%`
                : "Not enough reviews"}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              Review requests
            </div>
            <div className="mt-2 font-mono text-sm text-foreground">
              {requestCount.toLocaleString("en-US")}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-border bg-card/80 p-6 shadow-sm">
        <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
          Installed on
        </div>
        {skill.agentInstallData.length > 0 ? (
          <div className="mt-4 space-y-3">
            {skill.agentInstallData.map((agent) => (
              <div
                key={`${agent.agentSlug}-${agent.installCount}`}
                className="flex items-center justify-between gap-3 rounded-[1.25rem] border border-border bg-background px-4 py-3"
              >
                <span className="text-sm font-medium text-foreground">
                  {agent.agentName}
                </span>
                <span className="font-mono text-sm text-muted-foreground">
                  {agent.installCount.toLocaleString("en-US")}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Agent install distribution is not available yet for this skill.
          </p>
        )}
      </div>

      <div className="rounded-[1.75rem] border border-border bg-card/80 p-6 shadow-sm">
        <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
          Report listing
        </div>
        <div className="mt-4 text-sm leading-7 text-muted-foreground">
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

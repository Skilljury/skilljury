import type { Metadata } from "next";

import { ModerationQueueTable } from "@/components/admin/ModerationQueueTable";
import { requireModerator } from "@/lib/auth/guards";
import { getRecentAuditLog } from "@/lib/moderation/auditLog";
import { getModerationQueueItems } from "@/lib/moderation/queue";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "SkillJury moderation queue",
    description:
      "Review pending moderation items and audit-log activity for SkillJury.",
    indexable: false,
    pathname: "/admin/moderation",
  });
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AdminModerationPage() {
  await requireModerator("/admin/moderation");
  const [queueItems, auditLog] = await Promise.all([
    getModerationQueueItems(),
    getRecentAuditLog(12),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 lg:px-10 lg:py-14">
      <section className="rounded-[2rem] border border-border bg-card/80 p-7 shadow-sm">
        <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
          Admin
        </div>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-foreground">
          SkillJury moderation queue
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground">
          New-user reviews land here for approval, rejection, or escalation. Every
          action writes into the private audit log.
        </p>
      </section>

      <ModerationQueueTable items={queueItems} />

      <section className="rounded-[1.75rem] border border-border bg-card/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Recent audit log</h2>
        <div className="mt-5 space-y-3 text-sm">
          {auditLog.length > 0 ? (
            auditLog.map((entry) => (
              <div
                key={entry.id}
                className="rounded-[1.25rem] border border-border bg-background px-4 py-3"
              >
                <div className="font-medium text-foreground">{entry.actionType}</div>
                <div className="mt-1 text-muted-foreground">
                  {entry.targetType} #{entry.targetId} | {formatDate(entry.createdAt)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-muted-foreground">No audit-log entries yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}

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
      <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
        <div className="text-xs uppercase tracking-[0.28em] text-slate-500">
          Admin
        </div>
        <h1 className="mt-4 font-display text-5xl tracking-tight text-slate-950">
          SkillJury moderation queue
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
          New-user reviews land here for approval, rejection, or escalation. Every
          action writes into the private audit log.
        </p>
      </section>

      <ModerationQueueTable items={queueItems} />

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
        <h2 className="text-lg font-semibold text-slate-950">Recent audit log</h2>
        <div className="mt-5 space-y-3 text-sm">
          {auditLog.length > 0 ? (
            auditLog.map((entry) => (
              <div
                key={entry.id}
                className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div className="font-medium text-slate-950">{entry.actionType}</div>
                <div className="mt-1 text-slate-600">
                  {entry.targetType} #{entry.targetId} · {formatDate(entry.createdAt)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-slate-600">No audit-log entries yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}

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
      <section className="rounded-xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.1),transparent_35%),linear-gradient(135deg,rgba(20,20,24,0.98),rgba(8,8,10,0.96))] p-7 shadow-xl">
        <div className="text-xs uppercase tracking-[0.28em] text-zinc-500">
          Admin
        </div>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-white">
          SkillJury moderation queue
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-zinc-300">
          New-user reviews land here for approval, rejection, or escalation. Every
          action writes into the private audit log.
        </p>
      </section>

      <ModerationQueueTable items={queueItems} />

      <section className="rounded-xl border border-white/10 bg-white/[0.04] p-6 shadow-md">
        <h2 className="text-lg font-semibold text-white">Recent audit log</h2>
        <div className="mt-5 space-y-3 text-sm">
          {auditLog.length > 0 ? (
            auditLog.map((entry) => (
              <div
                key={entry.id}
                className="rounded-lg border border-white/10 bg-zinc-950/70 px-4 py-3"
              >
                <div className="font-medium text-white">{entry.actionType}</div>
                <div className="mt-1 text-zinc-400">
                  {entry.targetType} #{entry.targetId} - {formatDate(entry.createdAt)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-zinc-400">No audit-log entries yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}

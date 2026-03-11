import type { ModerationQueueItem } from "@/lib/moderation/queue";

import { ModerationActionBar } from "@/components/admin/ModerationActionBar";
import { EmptyStatePrompt } from "@/components/ui/EmptyStatePrompt";

type ModerationQueueTableProps = {
  items: ModerationQueueItem[];
};

export function ModerationQueueTable({ items }: ModerationQueueTableProps) {
  if (items.length === 0) {
    return (
      <EmptyStatePrompt
        description="The moderation queue is empty right now."
        title="No moderation items"
      />
    );
  }

  return (
    <div className="space-y-5">
      {items.map((item) => (
        <article
          key={item.id}
          className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_rgba(15,23,42,0.08)]"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-slate-400">
                {item.itemType} · Priority {item.priority}
              </div>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                {item.review?.skillName ??
                  item.submission?.name ??
                  `${item.report?.targetType ?? "Moderation"} item`}
              </h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">{item.queueReason}</p>
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-600">
              {item.status}
            </div>
          </div>

          {item.review ? (
            <div className="mt-5 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="space-y-3">
                <div className="text-sm text-slate-600">
                  Reviewer: <strong className="text-slate-950">{item.review.userName}</strong>
                </div>
                <div className="text-sm text-slate-600">
                  Rating: <strong className="text-slate-950">{item.review.overallRating}/5</strong>
                </div>
                <div className="rounded-[1.25rem] bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                  <div className="font-semibold text-slate-950">
                    {item.review.title ?? "No headline"}
                  </div>
                  <p className="mt-2">{item.review.body ?? item.review.pros}</p>
                </div>
              </div>
              <ModerationActionBar queueItemId={item.id} />
            </div>
          ) : item.submission ? (
            <div className="mt-5 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="space-y-3 rounded-[1.25rem] bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                <div>
                  <strong className="text-slate-950">Repository:</strong>{" "}
                  {item.submission.repositoryUrl}
                </div>
                {item.submission.sourceUrl ? (
                  <div>
                    <strong className="text-slate-950">Skill URL:</strong>{" "}
                    {item.submission.sourceUrl}
                  </div>
                ) : null}
                <div>
                  <strong className="text-slate-950">Summary:</strong>{" "}
                  {item.submission.summary ?? "No summary was provided."}
                </div>
              </div>
              <ModerationActionBar queueItemId={item.id} />
            </div>
          ) : item.report ? (
            <div className="mt-5 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="space-y-3 rounded-[1.25rem] bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                <div>
                  <strong className="text-slate-950">Target:</strong>{" "}
                  {item.report.targetType} #{item.report.targetId}
                </div>
                <div>
                  <strong className="text-slate-950">Reason:</strong>{" "}
                  {item.report.reason}
                </div>
                <div>
                  <strong className="text-slate-950">Notes:</strong>{" "}
                  {item.report.notes ?? "No extra context supplied."}
                </div>
              </div>
              <ModerationActionBar queueItemId={item.id} />
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}

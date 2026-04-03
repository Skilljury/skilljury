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
          className="rounded-[1.75rem] border border-border bg-card/80 p-6 shadow-sm"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                {item.itemType} | Priority {item.priority}
              </div>
              <h2 className="mt-3 text-2xl font-semibold text-foreground">
                {item.review?.skillName ??
                  item.submission?.name ??
                  `${item.report?.targetType ?? "Moderation"} item`}
              </h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.queueReason}</p>
            </div>
            <div className="rounded-full border border-border bg-background px-4 py-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
              {item.status}
            </div>
          </div>

          {item.review ? (
            <div className="mt-5 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Reviewer: <strong className="text-foreground">{item.review.userName}</strong>
                </div>
                <div className="text-sm text-muted-foreground">
                  Rating: <strong className="text-foreground">{item.review.overallRating}/5</strong>
                </div>
                <div className="rounded-[1.25rem] border border-border bg-background p-4 text-sm leading-7 text-muted-foreground">
                  <div className="font-semibold text-foreground">
                    {item.review.title ?? "No headline"}
                  </div>
                  <p className="mt-2">{item.review.body ?? item.review.pros}</p>
                </div>
              </div>
              <ModerationActionBar queueItemId={item.id} />
            </div>
          ) : item.submission ? (
            <div className="mt-5 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="space-y-3 rounded-[1.25rem] border border-border bg-background p-4 text-sm leading-7 text-muted-foreground">
                <div>
                  <strong className="text-foreground">Repository:</strong>{" "}
                  {item.submission.repositoryUrl}
                </div>
                {item.submission.sourceUrl ? (
                  <div>
                    <strong className="text-foreground">Skill URL:</strong>{" "}
                    {item.submission.sourceUrl}
                  </div>
                ) : null}
                <div>
                  <strong className="text-foreground">Summary:</strong>{" "}
                  {item.submission.summary ?? "No summary was provided."}
                </div>
              </div>
              <ModerationActionBar queueItemId={item.id} />
            </div>
          ) : item.report ? (
            <div className="mt-5 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="space-y-3 rounded-[1.25rem] border border-border bg-background p-4 text-sm leading-7 text-muted-foreground">
                <div>
                  <strong className="text-foreground">Target:</strong>{" "}
                  {item.report.targetType} #{item.report.targetId}
                </div>
                <div>
                  <strong className="text-foreground">Reason:</strong>{" "}
                  {item.report.reason}
                </div>
                <div>
                  <strong className="text-foreground">Notes:</strong>{" "}
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

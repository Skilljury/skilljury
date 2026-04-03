"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type ModerationActionBarProps = {
  queueItemId: number;
};

export function ModerationActionBar({
  queueItemId,
}: ModerationActionBarProps) {
  const router = useRouter();
  const [decisionNotes, setDecisionNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAction(action: "approve" | "reject" | "escalate") {
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/moderation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
            decisionNotes,
            queueItemId,
          }),
        });
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;

        if (!response.ok) {
          setErrorMessage(payload?.error ?? "Moderation action failed.");
          return;
        }

        router.refresh();
      } catch {
        setErrorMessage("Could not reach SkillJury. Try again.");
      }
    });
  }

  return (
    <div className="space-y-3">
      <textarea
        className="min-h-20 w-full rounded-[1.25rem] border border-border bg-background px-4 py-3 text-sm leading-7 text-foreground outline-none transition focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
        onChange={(event) => setDecisionNotes(event.target.value)}
        placeholder="Decision notes (optional)"
        value={decisionNotes}
      />
      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-500/15 disabled:border-border/70 disabled:text-muted-foreground dark:text-emerald-100"
          disabled={isPending}
          onClick={() => handleAction("approve")}
          type="button"
        >
          Approve
        </button>
        <button
          className="rounded-full border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/15 disabled:border-border/70 disabled:text-muted-foreground"
          disabled={isPending}
          onClick={() => handleAction("reject")}
          type="button"
        >
          Reject
        </button>
        <button
          className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary/20 hover:bg-card disabled:border-border/70 disabled:text-muted-foreground"
          disabled={isPending}
          onClick={() => handleAction("escalate")}
          type="button"
        >
          Escalate
        </button>
      </div>
      {errorMessage ? (
        <p className="text-sm leading-7 text-destructive">{errorMessage}</p>
      ) : null}
    </div>
  );
}

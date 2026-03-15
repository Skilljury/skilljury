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
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setErrorMessage(payload.error ?? "Moderation action failed.");
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <textarea
        className="min-h-20 w-full rounded-lg border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm leading-7 text-white outline-none transition focus:border-white/20 focus:bg-zinc-950"
        onChange={(event) => setDecisionNotes(event.target.value)}
        placeholder="Decision notes (optional)"
        value={decisionNotes}
      />
      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-full border border-emerald-500/20 bg-emerald-500/15 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:bg-emerald-500/25 disabled:border-white/8 disabled:bg-zinc-700 disabled:text-zinc-400"
          disabled={isPending}
          onClick={() => handleAction("approve")}
          type="button"
        >
          Approve
        </button>
        <button
          className="rounded-full border border-rose-500/20 bg-rose-500/15 px-4 py-2 text-sm font-medium text-rose-100 transition hover:bg-rose-500/25 disabled:border-white/8 disabled:bg-zinc-700 disabled:text-zinc-400"
          disabled={isPending}
          onClick={() => handleAction("reject")}
          type="button"
        >
          Reject
        </button>
        <button
          className="rounded-full border border-white/10 bg-zinc-950/80 px-4 py-2 text-sm font-medium text-white transition hover:border-white/20 hover:bg-zinc-900 disabled:border-white/8 disabled:bg-zinc-700 disabled:text-zinc-400"
          disabled={isPending}
          onClick={() => handleAction("escalate")}
          type="button"
        >
          Escalate
        </button>
      </div>
      {errorMessage ? (
        <p className="text-sm leading-7 text-rose-300">{errorMessage}</p>
      ) : null}
    </div>
  );
}

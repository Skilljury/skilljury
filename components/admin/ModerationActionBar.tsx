"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

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
        className="min-h-20 w-full rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-950 outline-none transition focus:border-slate-400 focus:bg-white"
        onChange={(event) => setDecisionNotes(event.target.value)}
        placeholder="Decision notes (optional)"
        value={decisionNotes}
      />
      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:bg-slate-300"
          disabled={isPending}
          onClick={() => handleAction("approve")}
          type="button"
        >
          Approve
        </button>
        <button
          className="rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-500 disabled:bg-slate-300"
          disabled={isPending}
          onClick={() => handleAction("reject")}
          type="button"
        >
          Reject
        </button>
        <button
          className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:bg-slate-300"
          disabled={isPending}
          onClick={() => handleAction("escalate")}
          type="button"
        >
          Escalate
        </button>
      </div>
      {errorMessage ? (
        <p className="text-sm leading-7 text-rose-700">{errorMessage}</p>
      ) : null}
    </div>
  );
}

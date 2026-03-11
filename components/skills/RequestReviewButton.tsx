"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { trackBrowserEvent } from "@/lib/analytics/events";

type RequestReviewButtonProps = {
  isSignedIn: boolean;
  loginHref: string;
  requestCount: number;
  skillSlug: string;
  viewerHasRequested: boolean;
};

export function RequestReviewButton({
  isSignedIn,
  loginHref,
  requestCount,
  skillSlug,
  viewerHasRequested,
}: RequestReviewButtonProps) {
  const router = useRouter();
  const [count, setCount] = useState(requestCount);
  const [hasRequested, setHasRequested] = useState(viewerHasRequested);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!isSignedIn) {
      router.push(loginHref);
      return;
    }

    setErrorMessage(null);

    startTransition(async () => {
      const response = await fetch("/api/review-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skillSlug,
        }),
      });
      const payload = (await response.json()) as {
        error?: string;
        totalCount?: number;
        viewerHasRequested?: boolean;
      };

      if (!response.ok) {
        setErrorMessage(payload.error ?? "Could not record the review request.");
        return;
      }

      setCount(payload.totalCount ?? count);
      setHasRequested(payload.viewerHasRequested ?? true);
      trackBrowserEvent("request_review_clicked", {
        skillSlug,
      });
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <button
        className="rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/8 disabled:cursor-not-allowed disabled:border-white/8 disabled:text-slate-400"
        disabled={isPending || hasRequested}
        onClick={handleClick}
        type="button"
      >
        {hasRequested
          ? "Review request recorded"
          : isPending
            ? "Recording request..."
            : "Request a review"}
      </button>
      <div className="text-xs uppercase tracking-[0.24em] text-slate-400">
        {count} review request{count === 1 ? "" : "s"}
      </div>
      {errorMessage ? <p className="text-sm text-rose-300">{errorMessage}</p> : null}
    </div>
  );
}

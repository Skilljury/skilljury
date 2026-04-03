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
      try {
        const response = await fetch("/api/review-requests", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            skillSlug,
          }),
        });
        const payload = (await response.json().catch(() => null)) as
          | {
              error?: string;
              totalCount?: number;
              viewerHasRequested?: boolean;
            }
          | null;

        if (!response.ok) {
          setErrorMessage(payload?.error ?? "Could not record the review request.");
          return;
        }

        setCount(payload?.totalCount ?? count);
        setHasRequested(payload?.viewerHasRequested ?? true);
        trackBrowserEvent("request_review_clicked", {
          skillSlug,
        });
        router.refresh();
      } catch {
        setErrorMessage("Could not reach SkillJury. Try again.");
      }
    });
  }

  return (
    <div className="space-y-3">
      <button
        className="rounded-full border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition hover:border-primary/20 hover:bg-card disabled:cursor-not-allowed disabled:border-border/70 disabled:text-muted-foreground"
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
      <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
        {count} review request{count === 1 ? "" : "s"}
      </div>
      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
    </div>
  );
}

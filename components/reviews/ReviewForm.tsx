"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import { OptionalDetailFields } from "@/components/reviews/OptionalDetailFields";
import { Toast } from "@/components/ui/Toast";
import { trackBrowserEvent } from "@/lib/analytics/events";

type ReviewFormProps = {
  agents: Array<{
    name: string;
    slug: string;
  }>;
  reviewer: {
    avatarUrl: string | null;
    displayName: string;
    email: string | null;
    username: string | null;
  };
  skillName: string;
  skillSlug: string;
  turnstileSiteKey: string;
};

export function ReviewForm({
  agents,
  reviewer,
  skillName,
  skillSlug,
  turnstileSiteKey,
}: ReviewFormProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const redirectTimeoutRef = useRef<number | null>(null);
  const ratingOptions = useMemo(() => [5, 4, 3, 2, 1], []);
  const turnstileReady = Boolean(turnstileSiteKey);
  const reviewerInitial =
    reviewer.displayName.trim().charAt(0).toUpperCase() ||
    reviewer.email?.trim().charAt(0).toUpperCase() ||
    "S";

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current !== null) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      try {
        const response = await fetch("/api/reviews", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            agentSlug: formData.get("agentSlug"),
            cons: formData.get("cons"),
            documentationRating: Number(formData.get("documentationRating")) || null,
            experienceLevel: formData.get("experienceLevel"),
            overallRating: Number(formData.get("overallRating")),
            outputQualityRating: Number(formData.get("outputQualityRating")) || null,
            proofOfUseType: formData.get("proofOfUseType"),
            proofOfUseUrl: formData.get("proofOfUseUrl"),
            pros: formData.get("pros"),
            reliabilityRating: Number(formData.get("reliabilityRating")) || null,
            reviewBody: formData.get("reviewBody"),
            reviewTitle: formData.get("reviewTitle"),
            setupRating: Number(formData.get("setupRating")) || null,
            skillSlug,
            turnstileToken: formData.get("turnstileToken"),
            useCase: formData.get("useCase"),
            valueForEffortRating: Number(formData.get("valueForEffortRating")) || null,
            wouldRecommend: formData.get("wouldRecommend"),
          }),
        });
        const payload = (await response.json().catch(() => null)) as
          | {
              error?: string;
              moderationStatus?: string;
            }
          | null;

        if (!response.ok) {
          setErrorMessage(payload?.error ?? "Could not submit your review.");
          return;
        }

        trackBrowserEvent("review_submitted", {
          moderationStatus: payload?.moderationStatus ?? "approved",
          overallRating: Number(formData.get("overallRating")),
          skillSlug,
          wouldRecommend: formData.get("wouldRecommend"),
        });

        setSuccessMessage(
          payload?.moderationStatus === "pending"
            ? "Your review was submitted and is waiting for moderation."
            : "Your review is live.",
        );
        form.reset();
        redirectTimeoutRef.current = window.setTimeout(() => {
          router.push(`/skills/${skillSlug}`);
          router.refresh();
        }, 900);
      } catch {
        setErrorMessage("Could not submit your review. Check your connection and try again.");
      }
    });
  }

  return (
    <div className="space-y-5">
      {turnstileReady ? (
        <Script
          async
          defer
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        />
      ) : null}

      <form
        className="space-y-6 rounded-[1.75rem] border border-border bg-card/80 p-6 shadow-sm sm:p-7"
        onSubmit={handleSubmit}
      >
        <div className="flex items-center gap-4 rounded-[1.25rem] border border-border bg-background/70 px-4 py-3">
          {reviewer.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={`${reviewer.displayName} avatar`}
              className="h-12 w-12 rounded-full border border-border object-cover"
              referrerPolicy="no-referrer"
              src={reviewer.avatarUrl}
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-secondary text-sm font-semibold text-foreground">
              {reviewerInitial}
            </div>
          )}

          <div className="min-w-0 space-y-1">
            <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              Signed in as
            </div>
            <div className="truncate text-sm font-medium text-foreground">
              {reviewer.displayName}
            </div>
            {reviewer.email ? (
              <div className="truncate text-sm text-muted-foreground">{reviewer.email}</div>
            ) : null}
            {reviewer.username ? (
              <div className="font-mono text-xs text-muted-foreground">
                @{reviewer.username}
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
            Review {skillName}
          </h2>
          <p className="text-sm leading-7 text-muted-foreground">
            Only four fields are required. The rest stays optional so the form remains
            quick to finish.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-foreground">Overall rating</span>
            <select
                className="rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary/30 focus:bg-background focus:ring-4 focus:ring-primary/10"
              defaultValue="5"
              name="overallRating"
              required
            >
              {ratingOptions.map((value) => (
                <option key={value} value={value}>
                  {value}/5
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-foreground">Would recommend</span>
            <select
                className="rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary/30 focus:bg-background focus:ring-4 focus:ring-primary/10"
              defaultValue="yes"
              name="wouldRecommend"
              required
            >
              <option value="yes">Yes</option>
              <option value="with_caveats">With caveats</option>
              <option value="no">No</option>
            </select>
          </label>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-foreground">Pros</span>
          <textarea
                className="min-h-28 rounded-[1.25rem] border border-border bg-background/70 px-4 py-3 text-sm leading-7 text-foreground outline-none transition focus:border-primary/30 focus:bg-background focus:ring-4 focus:ring-primary/10"
            name="pros"
            placeholder="What worked well?"
            required
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-foreground">Cons</span>
          <textarea
                className="min-h-28 rounded-[1.25rem] border border-border bg-background/70 px-4 py-3 text-sm leading-7 text-foreground outline-none transition focus:border-primary/30 focus:bg-background focus:ring-4 focus:ring-primary/10"
            name="cons"
            placeholder="What did not work, or what still needs improvement?"
            required
          />
        </label>

        <OptionalDetailFields agents={agents} />

        {turnstileReady ? (
          <div
            className="cf-turnstile"
            data-response-field-name="turnstileToken"
            data-sitekey={turnstileSiteKey}
          />
        ) : (
          <div className="rounded-[1.25rem] border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm leading-7 text-amber-200">
            Review submission is disabled until Turnstile is configured for this environment.
          </div>
        )}

        <button
          aria-busy={isPending}
            className="rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending || !turnstileReady}
          type="submit"
        >
          {isPending ? "Submitting review..." : "Submit review"}
        </button>
      </form>

      {errorMessage ? <Toast message={errorMessage} tone="error" /> : null}
      {successMessage ? <Toast message={successMessage} tone="success" /> : null}
    </div>
  );
}

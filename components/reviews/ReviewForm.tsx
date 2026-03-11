"use client";

import Script from "next/script";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { OptionalDetailFields } from "@/components/reviews/OptionalDetailFields";
import { trackBrowserEvent } from "@/lib/analytics/events";

type ReviewFormProps = {
  agents: Array<{
    name: string;
    slug: string;
  }>;
  skillName: string;
  skillSlug: string;
  turnstileSiteKey: string;
};

export function ReviewForm({
  agents,
  skillName,
  skillSlug,
  turnstileSiteKey,
}: ReviewFormProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const ratingOptions = useMemo(() => [5, 4, 3, 2, 1], []);
  const turnstileReady = Boolean(turnstileSiteKey);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
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
      const payload = (await response.json()) as {
        error?: string;
        moderationStatus?: string;
      };

      if (!response.ok) {
        setErrorMessage(payload.error ?? "Could not submit your review.");
        return;
      }

      trackBrowserEvent("review_submitted", {
        moderationStatus: payload.moderationStatus ?? "approved",
        overallRating: Number(formData.get("overallRating")),
        skillSlug,
        wouldRecommend: formData.get("wouldRecommend"),
      });

      setSuccessMessage(
        payload.moderationStatus === "pending"
          ? "Your review was submitted and is waiting for moderation."
          : "Your review is live.",
      );
      form.reset();
      setTimeout(() => {
        router.push(`/skills/${skillSlug}`);
        router.refresh();
      }, 900);
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
        className="space-y-5 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_rgba(15,23,42,0.08)]"
        onSubmit={handleSubmit}
      >
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-slate-950">
            Review {skillName}
          </h2>
          <p className="text-sm leading-7 text-slate-600">
            Only four fields are required. Everything else is optional and hidden
            behind the expandable section.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-900">Overall rating</span>
            <select
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:bg-white"
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
            <span className="text-sm font-medium text-slate-900">Would recommend</span>
            <select
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:bg-white"
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
          <span className="text-sm font-medium text-slate-900">Pros</span>
          <textarea
            className="min-h-28 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-950 outline-none transition focus:border-slate-400 focus:bg-white"
            name="pros"
            placeholder="What worked well?"
            required
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-900">Cons</span>
          <textarea
            className="min-h-28 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-950 outline-none transition focus:border-slate-400 focus:bg-white"
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
          <div className="rounded-[1.25rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-900">
            Review submission is disabled until Turnstile is configured for this environment.
          </div>
        )}

        <button
          className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={isPending || !turnstileReady}
          type="submit"
        >
          {isPending ? "Submitting review..." : "Submit review"}
        </button>
      </form>

      {errorMessage ? (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50/80 p-5 text-sm leading-7 text-rose-800">
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50/80 p-5 text-sm leading-7 text-emerald-900">
          {successMessage}
        </div>
      ) : null}
    </div>
  );
}

"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Toast } from "@/components/ui/Toast";
import { trackBrowserEvent } from "@/lib/analytics/events";
import type { ReportReason } from "@/lib/reports/createReport";

type ReportDialogProps = {
  isSignedIn: boolean;
  loginHref: string;
  targetId: string;
  targetLabel: string;
  targetType: "review" | "skill";
  turnstileSiteKey: string;
};

const reasons: Array<{
  label: string;
  value: ReportReason;
}> = [
  { label: "Spam", value: "spam" },
  { label: "Fake review", value: "fake_review" },
  { label: "Off-topic", value: "off_topic" },
  { label: "Abuse or harassment", value: "abuse_harassment" },
  { label: "Wrong listing data", value: "wrong_listing_data" },
  { label: "Copyright issue", value: "copyright_issue" },
  { label: "Other", value: "other" },
];

export function ReportDialog({
  isSignedIn,
  loginHref,
  targetId,
  targetLabel,
  targetType,
  turnstileSiteKey,
}: ReportDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const turnstileReady = Boolean(turnstileSiteKey);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      try {
        const response = await fetch("/api/reports", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            notes: formData.get("notes"),
            reason: formData.get("reason"),
            targetId,
            targetType,
            turnstileToken: formData.get("turnstileToken"),
          }),
        });
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;

        if (!response.ok) {
          setErrorMessage(payload?.error ?? "Could not submit the report.");
          return;
        }

        trackBrowserEvent("report_submitted", {
          reason: formData.get("reason"),
          targetType,
        });

        setSuccessMessage("Your report was submitted for moderator review.");
        form.reset();
        setIsOpen(false);
        router.refresh();
      } catch {
        setErrorMessage("Could not reach SkillJury. Try again.");
      }
    });
  }

  if (!isSignedIn) {
    return (
      <button
        className="text-xs font-medium text-muted-foreground underline decoration-border underline-offset-4"
        onClick={() => router.push(loginHref)}
        type="button"
      >
        Sign in to report {targetLabel}
      </button>
    );
  }

  return (
    <div className="space-y-3">
      {turnstileReady ? (
        <Script
          async
          defer
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        />
      ) : null}

      <button
        className="text-xs font-medium text-muted-foreground underline decoration-border underline-offset-4"
        onClick={() => setIsOpen((value) => !value)}
        type="button"
      >
        {isOpen ? "Cancel report" : `Report ${targetLabel}`}
      </button>

      {isOpen ? (
        <form
          className="rounded-[1.5rem] border border-border bg-card/80 p-4 text-sm"
          onSubmit={handleSubmit}
        >
          <label className="grid gap-2">
            <span className="font-medium text-foreground">Reason</span>
            <select
              className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
              defaultValue="spam"
              name="reason"
              required
            >
              {reasons.map((reason) => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-4 grid gap-2">
            <span className="font-medium text-foreground">Notes</span>
            <textarea
              className="min-h-24 rounded-[1.25rem] border border-border bg-background px-4 py-3 text-sm leading-7 text-foreground outline-none transition focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
              name="notes"
              placeholder="Add any context that will help a moderator review this report."
            />
          </label>

          {turnstileReady ? (
            <div
              className="cf-turnstile mt-4"
              data-response-field-name="turnstileToken"
              data-sitekey={turnstileSiteKey}
            />
          ) : (
            <div className="mt-4 rounded-[1.25rem] border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm leading-7 text-amber-900 dark:text-amber-100">
              Reporting is disabled until Turnstile is configured for this environment.
            </div>
          )}

          <button
            className="mt-4 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-95 disabled:opacity-60"
            disabled={isPending || !turnstileReady}
            type="submit"
          >
            {isPending ? "Submitting report..." : "Submit report"}
          </button>
        </form>
      ) : null}

      {errorMessage ? <Toast message={errorMessage} tone="error" /> : null}
      {successMessage ? <Toast message={successMessage} tone="success" /> : null}
    </div>
  );
}

"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { Toast } from "@/components/ui/Toast";
import { trackBrowserEvent } from "@/lib/analytics/events";

type SubmissionPrefill = {
  inferredAgents: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  inferredName: string | null;
  inferredSourceUrl: string | null;
  inferredSummary: string | null;
  repositoryUrl: string | null;
};

type SubmitSkillFormProps = {
  turnstileSiteKey: string;
};

export function SubmitSkillForm({ turnstileSiteKey }: SubmitSkillFormProps) {
  const router = useRouter();
  const refreshTimeoutRef = useRef<number | null>(null);
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [proposedName, setProposedName] = useState("");
  const [proposedSummary, setProposedSummary] = useState("");
  const [prefill, setPrefill] = useState<SubmissionPrefill | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPrefillPending, startPrefillTransition] = useTransition();
  const [isSubmitPending, startSubmitTransition] = useTransition();
  const turnstileReady = Boolean(turnstileSiteKey);

  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current !== null) {
        window.clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  function handlePrefill() {
    if (!repositoryUrl.trim()) {
      return;
    }

    setErrorMessage(null);

    startPrefillTransition(async () => {
      try {
        const response = await fetch("/api/submissions/prefill", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            repositoryUrl,
            sourceUrl,
          }),
        });
        const payload = (await response.json().catch(() => null)) as
          | {
              error?: string;
              prefill?: SubmissionPrefill;
            }
          | null;

        if (!response.ok || !payload?.prefill) {
          setErrorMessage(
            payload?.error ?? "SkillJury could not prefill this repository.",
          );
          return;
        }

        setPrefill(payload.prefill);
        if (payload.prefill.inferredSourceUrl && !sourceUrl.trim()) {
          setSourceUrl(payload.prefill.inferredSourceUrl);
        }
        if (!proposedName.trim() && payload.prefill.inferredName) {
          setProposedName(payload.prefill.inferredName);
        }
        if (!proposedSummary.trim() && payload.prefill.inferredSummary) {
          setProposedSummary(payload.prefill.inferredSummary);
        }
      } catch {
        setErrorMessage("SkillJury could not prefill this repository.");
      }
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    const form = event.currentTarget;
    const formData = new FormData(form);

    startSubmitTransition(async () => {
      try {
        const response = await fetch("/api/submissions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            proposedCategory: formData.get("proposedCategory"),
            proposedName: formData.get("proposedName"),
            proposedSummary: formData.get("proposedSummary"),
            repositoryUrl: formData.get("repositoryUrl"),
            sourceUrl: formData.get("sourceUrl"),
            turnstileToken: formData.get("turnstileToken"),
          }),
        });
        const payload = (await response.json().catch(() => null)) as
          | {
              error?: string;
            }
          | null;

        if (!response.ok) {
          setErrorMessage(
            payload?.error ?? "SkillJury could not submit this skill.",
          );
          return;
        }

        let repositoryHost = "unknown";

        try {
          repositoryHost = new URL(repositoryUrl).hostname;
        } catch {
          repositoryHost = "unknown";
        }

        trackBrowserEvent("skill_submission_created", {
          hasSourceUrl: Boolean(formData.get("sourceUrl")),
          proposedCategory: String(formData.get("proposedCategory") ?? ""),
          repositoryHost,
        });

        setSuccessMessage(
          "Your skill submission was added to the moderation queue for review.",
        );
        form.reset();
        setPrefill(null);
        setProposedName("");
        setProposedSummary("");
        setRepositoryUrl("");
        setSourceUrl("");
        refreshTimeoutRef.current = window.setTimeout(() => {
          router.refresh();
        }, 800);
      } catch {
        setErrorMessage("SkillJury could not submit this skill.");
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
        className="space-y-6 rounded-[2rem] border border-border bg-card/80 p-6 shadow-sm md:p-8"
        onSubmit={handleSubmit}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Repository URL
            </span>
            <input
              className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-default placeholder:text-muted-foreground focus:border-primary/60"
              name="repositoryUrl"
              onBlur={handlePrefill}
              onChange={(event) => setRepositoryUrl(event.target.value)}
              placeholder="https://github.com/owner/repository"
              required
              type="url"
              value={repositoryUrl}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Skill URL
            </span>
            <input
              className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-default placeholder:text-muted-foreground focus:border-primary/60"
              name="sourceUrl"
              onChange={(event) => setSourceUrl(event.target.value)}
              placeholder="https://example.com/skill-page"
              type="url"
              value={sourceUrl}
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Proposed name
            </span>
            <input
              className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-default placeholder:text-muted-foreground focus:border-primary/60"
              name="proposedName"
              onChange={(event) => setProposedName(event.target.value)}
              placeholder="What should the skill be called?"
              type="text"
              value={proposedName}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Suggested category
            </span>
            <input
              className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-default placeholder:text-muted-foreground focus:border-primary/60"
              name="proposedCategory"
              placeholder="Example: software engineering, research, writing"
              type="text"
            />
          </label>
        </div>

        <label className="grid gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Why it belongs in SkillJury
          </span>
          <textarea
            className="min-h-32 rounded-[1.5rem] border border-border bg-background px-4 py-3 text-sm leading-7 text-foreground outline-none transition-default placeholder:text-muted-foreground focus:border-primary/60"
            name="proposedSummary"
            onChange={(event) => setProposedSummary(event.target.value)}
            placeholder="Add a concise summary, use case, or note for the moderator."
            value={proposedSummary}
          />
        </label>

        <div className="rounded-[1.5rem] border border-border bg-surface-elevated/70 p-5 text-sm leading-7 text-foreground/80">
          <div className="font-semibold text-foreground">
            {isPrefillPending ? "Checking repository metadata..." : "Auto-fill preview"}
          </div>
          {prefill ? (
            <div className="mt-3 space-y-2">
              <p>
                <strong>Name:</strong> {prefill.inferredName ?? "No name inferred yet."}
              </p>
              <p>
                <strong>Summary:</strong>{" "}
                {prefill.inferredSummary ?? "No repository summary was detected."}
              </p>
              <p>
                <strong>Agent compatibility:</strong>{" "}
                {prefill.inferredAgents.length > 0
                  ? prefill.inferredAgents.map((agent) => agent.name).join(", ")
                  : "No agent compatibility was inferred from the public repo metadata."}
              </p>
            </div>
          ) : (
            <p className="mt-3">
              Paste a GitHub repository URL and tab out of the field to let SkillJury
              prefill what it can before you submit.
            </p>
          )}
        </div>

        {turnstileReady ? (
          <div
            className="cf-turnstile"
            data-response-field-name="turnstileToken"
            data-sitekey={turnstileSiteKey}
          />
        ) : (
          <div className="rounded-[1.5rem] border border-primary/30 bg-primary/10 px-4 py-3 text-sm leading-7 text-foreground">
            Skill submission is disabled until Turnstile is configured for this environment.
          </div>
        )}

        <button
          className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-default hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
          disabled={isSubmitPending || !turnstileReady}
          type="submit"
        >
          {isSubmitPending ? "Submitting skill..." : "Submit skill for review"}
        </button>
      </form>

      {errorMessage ? <Toast message={errorMessage} tone="error" /> : null}
      {successMessage ? <Toast message={successMessage} tone="success" /> : null}
    </div>
  );
}

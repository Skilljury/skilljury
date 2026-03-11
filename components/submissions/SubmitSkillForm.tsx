"use client";

import Script from "next/script";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

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

  function handlePrefill() {
    if (!repositoryUrl.trim()) {
      return;
    }

    setErrorMessage(null);

    startPrefillTransition(async () => {
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
      const payload = (await response.json()) as {
        error?: string;
        prefill?: SubmissionPrefill;
      };

      if (!response.ok || !payload.prefill) {
        setErrorMessage(payload.error ?? "SkillJury could not prefill this repository.");
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
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    const form = event.currentTarget;
    const formData = new FormData(form);

    startSubmitTransition(async () => {
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
      const payload = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        setErrorMessage(payload.error ?? "SkillJury could not submit this skill.");
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
      setTimeout(() => {
        router.refresh();
      }, 800);
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
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-900">Repository URL</span>
            <input
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:bg-white"
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
            <span className="text-sm font-medium text-slate-900">Skill URL</span>
            <input
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:bg-white"
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
            <span className="text-sm font-medium text-slate-900">Proposed name</span>
            <input
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:bg-white"
              name="proposedName"
              onChange={(event) => setProposedName(event.target.value)}
              placeholder="What should the skill be called?"
              type="text"
              value={proposedName}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-900">Suggested category</span>
            <input
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:bg-white"
              name="proposedCategory"
              placeholder="Example: software engineering, research, writing"
              type="text"
            />
          </label>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-900">Why it belongs in SkillJury</span>
          <textarea
            className="min-h-32 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-950 outline-none transition focus:border-slate-400 focus:bg-white"
            name="proposedSummary"
            onChange={(event) => setProposedSummary(event.target.value)}
            placeholder="Add a concise summary, use case, or note for the moderator."
            value={proposedSummary}
          />
        </label>

        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5 text-sm leading-7 text-slate-700">
          <div className="font-semibold text-slate-950">
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
          <div className="rounded-[1.25rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-900">
            Skill submission is disabled until Turnstile is configured for this environment.
          </div>
        )}

        <button
          className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
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

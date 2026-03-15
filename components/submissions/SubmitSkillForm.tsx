"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

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
        className="space-y-5 rounded-xl border border-white/10 bg-white/[0.04] p-6 shadow-md"
        onSubmit={handleSubmit}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-white">Repository URL</span>
            <input
              className="rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-zinc-950"
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
            <span className="text-sm font-medium text-white">Skill URL</span>
            <input
              className="rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-zinc-950"
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
            <span className="text-sm font-medium text-white">Proposed name</span>
            <input
              className="rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-zinc-950"
              name="proposedName"
              onChange={(event) => setProposedName(event.target.value)}
              placeholder="What should the skill be called?"
              type="text"
              value={proposedName}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-white">Suggested category</span>
            <input
              className="rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-zinc-950"
              name="proposedCategory"
              placeholder="Example: software engineering, research, writing"
              type="text"
            />
          </label>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-white">Why it belongs in SkillJury</span>
          <textarea
            className="min-h-32 rounded-lg border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm leading-7 text-white outline-none transition focus:border-white/20 focus:bg-zinc-950"
            name="proposedSummary"
            onChange={(event) => setProposedSummary(event.target.value)}
            placeholder="Add a concise summary, use case, or note for the moderator."
            value={proposedSummary}
          />
        </label>

        <div className="rounded-lg border border-white/10 bg-zinc-950/70 p-5 text-sm leading-7 text-zinc-300">
          <div className="font-semibold text-white">
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
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm leading-7 text-amber-200">
            Skill submission is disabled until Turnstile is configured for this environment.
          </div>
        )}

        <button
          className="rounded-full bg-white px-5 py-3 text-sm font-medium text-zinc-950 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:bg-zinc-500 disabled:text-zinc-900"
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

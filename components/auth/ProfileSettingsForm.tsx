"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { Toast } from "@/components/ui/Toast";
import { validateUsername } from "@/lib/auth/username";

type ProfileSettingsFormProps = {
  initialDisplayName: string;
  initialUsername: string;
  mode: "account" | "setup";
  nextPath: string;
};

export function ProfileSettingsForm({
  initialDisplayName,
  initialUsername,
  mode,
  nextPath,
}: ProfileSettingsFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [username, setUsername] = useState(initialUsername);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const normalizedPreview = useMemo(
    () => validateUsername(username).normalized ?? "",
    [username],
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const usernameResult = validateUsername(username);

    if (usernameResult.error) {
      setErrorMessage(usernameResult.error);
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/auth/profile", {
        body: JSON.stringify({
          displayName,
          username: usernameResult.normalized,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setErrorMessage(payload.error ?? "Could not save your profile.");
        return;
      }

      setSuccessMessage(
        mode === "setup"
          ? "Your SkillJury account is ready."
          : "Profile updated.",
      );

      setTimeout(() => {
        router.push(mode === "setup" ? nextPath : "/account");
        router.refresh();
      }, 700);
    });
  }

  return (
    <div className="space-y-5">
      <form
        className="space-y-5 rounded-xl border border-white/10 bg-white/[0.04] p-6 shadow-md"
        onSubmit={handleSubmit}
      >
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-white">
            {mode === "setup" ? "Choose your public SkillJury ID" : "Public identity"}
          </h2>
          <p className="text-sm leading-7 text-zinc-400">
            {mode === "setup"
              ? "Reviews and skill submissions use this public ID. Pick a handle you are comfortable showing on the site."
              : "Update the public identity shown on your reviews and submissions."}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-white">Display name</span>
            <input
              className="rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-zinc-950"
              maxLength={80}
              name="displayName"
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="How your name appears publicly"
              value={displayName}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-white">Username / ID</span>
            <input
              className="rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-zinc-950"
              maxLength={32}
              minLength={3}
              name="username"
              onChange={(event) => setUsername(event.target.value)}
              placeholder="your-id"
              required
              spellCheck={false}
              value={username}
            />
            <p className="text-xs leading-6 text-zinc-500">
              Lowercase letters, numbers, hyphens, and underscores. Preview:{" "}
              <span className="font-mono text-zinc-300">
                {normalizedPreview || "your-id"}
              </span>
            </p>
          </label>
        </div>

        <button
          className="rounded-full bg-white px-5 py-3 text-sm font-medium text-zinc-950 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:bg-zinc-500 disabled:text-zinc-900"
          disabled={isPending}
          type="submit"
        >
          {isPending
            ? mode === "setup"
              ? "Saving your ID..."
              : "Saving changes..."
            : mode === "setup"
              ? "Finish account setup"
              : "Save profile"}
        </button>
      </form>

      {errorMessage ? <Toast message={errorMessage} tone="error" /> : null}
      {successMessage ? <Toast message={successMessage} tone="success" /> : null}
    </div>
  );
}

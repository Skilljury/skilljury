"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

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
  const redirectTimeoutRef = useRef<number | null>(null);
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [username, setUsername] = useState(initialUsername);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const normalizedPreview = useMemo(
    () => validateUsername(username).normalized ?? "",
    [username],
  );

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

    const usernameResult = validateUsername(username);

    if (usernameResult.error) {
      setErrorMessage(usernameResult.error);
      return;
    }

    startTransition(async () => {
      try {
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
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;

        if (!response.ok) {
          setErrorMessage(payload?.error ?? "Could not save your profile.");
          return;
        }

        setSuccessMessage(
          mode === "setup"
            ? "Your SkillJury account is ready."
            : "Profile updated.",
        );

        redirectTimeoutRef.current = window.setTimeout(() => {
          router.push(mode === "setup" ? nextPath : "/account");
          router.refresh();
        }, 700);
      } catch {
        setErrorMessage("Could not save your profile.");
      }
    });
  }

  return (
    <div className="space-y-5">
      <form
        className="space-y-6 rounded-[2rem] border border-border bg-card/80 p-6 shadow-sm md:p-8"
        onSubmit={handleSubmit}
      >
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">
            {mode === "setup" ? "Choose your public SkillJury ID" : "Public identity"}
          </h2>
          <p className="text-sm leading-7 text-muted-foreground">
            {mode === "setup"
              ? "Reviews and skill submissions use this public ID. Pick a handle you are comfortable showing on the site."
              : "Update the public identity shown on your reviews and submissions."}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Display name
            </span>
            <input
              className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-default placeholder:text-muted-foreground focus:border-primary/60"
              maxLength={80}
              name="displayName"
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="How your name appears publicly"
              value={displayName}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Username / ID
            </span>
            <input
              className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-default placeholder:text-muted-foreground focus:border-primary/60"
              maxLength={32}
              minLength={3}
              name="username"
              onChange={(event) => setUsername(event.target.value)}
              placeholder="your-id"
              required
              spellCheck={false}
              value={username}
            />
            <p className="text-xs leading-6 text-muted-foreground">
              Lowercase letters, numbers, hyphens, and underscores. Preview:{" "}
              <span className="font-mono text-foreground">
                {normalizedPreview || "your-id"}
              </span>
            </p>
          </label>
        </div>

        <button
          className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-default hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
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

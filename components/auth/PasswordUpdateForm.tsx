"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import { Toast } from "@/components/ui/Toast";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type PasswordUpdateFormProps = {
  nextPath: string;
};

export function PasswordUpdateForm({ nextPath }: PasswordUpdateFormProps) {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (password.length < 8) {
      setErrorMessage("Passwords must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Password confirmation does not match.");
      return;
    }

    startTransition(async () => {
      try {
        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
          setErrorMessage(error.message);
          return;
        }

        setSuccessMessage("Password updated.");
        redirectTimeoutRef.current = setTimeout(() => {
          router.push(nextPath);
          router.refresh();
        }, 700);
      } catch {
        setErrorMessage("Could not update your password. Try again.");
      }
    });
  }

  return (
    <div className="space-y-5">
      <form
        className="space-y-4 rounded-[2rem] border border-border bg-card/80 p-6 shadow-sm"
        onSubmit={handleSubmit}
      >
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">Choose a new password</h2>
          <p className="text-sm leading-7 text-muted-foreground">
            Set a new password for your SkillJury account, then continue back to the
            product.
          </p>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-foreground">New password</span>
          <input
            autoComplete="new-password"
            className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-foreground">Confirm password</span>
          <input
            autoComplete="new-password"
            className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
            minLength={8}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            type="password"
            value={confirmPassword}
          />
        </label>

        <button
          className="rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Updating password..." : "Save new password"}
        </button>
      </form>

      {errorMessage ? <Toast message={errorMessage} tone="error" /> : null}
      {successMessage ? <Toast message={successMessage} tone="success" /> : null}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

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
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setSuccessMessage("Password updated.");
      setTimeout(() => {
        router.push(nextPath);
        router.refresh();
      }, 700);
    });
  }

  return (
    <div className="space-y-5">
      <form
        className="space-y-4 rounded-xl border border-white/10 bg-white/[0.04] p-6 shadow-md"
        onSubmit={handleSubmit}
      >
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-white">Choose a new password</h2>
          <p className="text-sm leading-7 text-zinc-400">
            Set a new password for your SkillJury account, then continue back to the
            product.
          </p>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-white">New password</span>
          <input
            autoComplete="new-password"
            className="rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-zinc-950"
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-white">Confirm password</span>
          <input
            autoComplete="new-password"
            className="rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-zinc-950"
            minLength={8}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            type="password"
            value={confirmPassword}
          />
        </label>

        <button
          className="rounded-full bg-white px-5 py-3 text-sm font-medium text-zinc-950 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:bg-zinc-500 disabled:text-zinc-900"
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

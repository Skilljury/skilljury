"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type MagicLinkFormProps = {
  adminEmail: string | null;
  redirectTo: string;
};

const COOLDOWN_MS = 30_000;

export function MagicLinkForm({ adminEmail, redirectTo }: MagicLinkFormProps) {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sentEmail, setSentEmail] = useState<string | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [timeLeftMs, setTimeLeftMs] = useState(0);
  const [isPending, startTransition] = useTransition();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  useEffect(() => {
    if (!cooldownUntil) {
      return;
    }

    const updateTimer = () => {
      const nextValue = Math.max(0, cooldownUntil - Date.now());
      setTimeLeftMs(nextValue);

      if (nextValue === 0) {
        setCooldownUntil(null);
      }
    };

    updateTimer();
    const timer = window.setInterval(updateTimer, 1_000);

    return () => {
      window.clearInterval(timer);
    };
  }, [cooldownUntil]);

  const isCoolingDown = timeLeftMs > 0;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setTimeLeftMs(COOLDOWN_MS);
        setCooldownUntil(Date.now() + COOLDOWN_MS);
        return;
      }

      setSentEmail(email.trim());
      setTimeLeftMs(COOLDOWN_MS);
      setCooldownUntil(Date.now() + COOLDOWN_MS);
    });
  }

  return (
    <div className="space-y-5">
      <form
        className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_rgba(15,23,42,0.08)]"
        onSubmit={handleSubmit}
      >
        <div className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-900">Email address</span>
            <input
              autoComplete="email"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:bg-white"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              type="email"
              value={email}
            />
          </label>

          <button
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={isPending || isCoolingDown}
            type="submit"
          >
            {isPending
              ? "Sending magic link..."
              : isCoolingDown
                ? `Retry in ${Math.ceil(timeLeftMs / 1_000)}s`
                : "Send magic link"}
          </button>
        </div>
      </form>

      {sentEmail ? (
        <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50/80 p-5 text-sm leading-7 text-emerald-900">
          <div className="font-semibold">Check your inbox</div>
          <p className="mt-2">
            A sign-in link was sent to <strong>{sentEmail}</strong>. Open the email on
            this device to finish signing in.
          </p>
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50/80 p-5 text-sm leading-7 text-amber-950">
          <div className="font-semibold">Email delivery may have failed</div>
          <p className="mt-2">
            SkillJury could not send the magic link on this attempt: {errorMessage}
          </p>
          <p className="mt-2">
            Confirm the address, wait for the cooldown, and retry. If the address is
            bouncing or still does not receive mail, contact{" "}
            {adminEmail ? <strong>{adminEmail}</strong> : "the site admin"}.
          </p>
        </div>
      ) : (
        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5 text-sm leading-7 text-slate-700">
          <div className="font-semibold text-slate-900">If the email does not arrive</div>
          <p className="mt-2">
            Wait a minute, check spam, then use the retry option. Repeated failures can
            indicate a typo or a bounced address.
          </p>
        </div>
      )}
    </div>
  );
}

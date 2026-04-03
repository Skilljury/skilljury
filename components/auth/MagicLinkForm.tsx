"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type MagicLinkFormProps = {
  adminEmail: string | null;
  nextPath: string;
};

const COOLDOWN_MS = 30_000;

function buildBrowserRedirectUrl(nextPath: string) {
  if (typeof window === "undefined") {
    return "";
  }

  const url = new URL("/auth/callback", window.location.origin);
  url.searchParams.set("next", nextPath);
  return url.toString();
}

export function MagicLinkForm({ adminEmail, nextPath }: MagicLinkFormProps) {
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
      const redirectTo = buildBrowserRedirectUrl(nextPath);
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
        className="rounded-[2rem] border border-border bg-card/80 p-6 shadow-sm"
        onSubmit={handleSubmit}
      >
        <div className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-foreground">Email address</span>
            <input
              autoComplete="email"
              className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              type="email"
              value={email}
            />
          </label>

          <button
            className="rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
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
        <div className="rounded-[1.5rem] border border-emerald-500/20 bg-emerald-500/10 p-5 text-sm leading-7 text-emerald-700 dark:text-emerald-100">
          <div className="font-semibold">Check your inbox</div>
          <p className="mt-2">
            A sign-in link was sent to <strong>{sentEmail}</strong>. Open the email on
            this device to finish signing in.
          </p>
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-[1.5rem] border border-amber-500/20 bg-amber-500/10 p-5 text-sm leading-7 text-amber-900 dark:text-amber-100">
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
        <div className="rounded-[1.5rem] border border-border bg-card/80 p-5 text-sm leading-7 text-muted-foreground">
          <div className="font-semibold text-foreground">If the email does not arrive</div>
          <p className="mt-2">
            Wait a minute, check spam, then use the retry option. Repeated failures can
            indicate a typo or a bounced address.
          </p>
        </div>
      )}
    </div>
  );
}

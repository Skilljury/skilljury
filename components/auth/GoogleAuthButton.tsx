"use client";

import { useMemo, useState, useTransition } from "react";

import { buildBrowserAuthCallbackUrl } from "@/lib/auth/browser";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type GoogleAuthButtonProps = {
  label?: string;
  nextPath: string;
};

function toFriendlyGoogleError(message: string) {
  if (message.includes("Unsupported provider")) {
    return "Google sign-in is not enabled for this deployment yet. Use email and password for now.";
  }

  return message;
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
      <path
        d="M21.8 12.23c0-.74-.06-1.45-.2-2.13H12v4.04h5.48a4.69 4.69 0 0 1-2.03 3.08v2.56h3.28c1.92-1.77 3.07-4.38 3.07-7.55Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.76 0 5.08-.91 6.77-2.48l-3.28-2.56c-.91.61-2.07.97-3.49.97-2.68 0-4.95-1.81-5.76-4.23H2.85v2.64A10 10 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.24 13.7A5.98 5.98 0 0 1 5.92 12c0-.59.11-1.17.32-1.7V7.66H2.85A10 10 0 0 0 2 12c0 1.61.39 3.13 1.08 4.34l3.16-2.64Z"
        fill="#FBBC05"
      />
      <path
        d="M12 6.08c1.5 0 2.84.52 3.89 1.54l2.91-2.91C17.07 3.06 14.76 2 12 2A10 10 0 0 0 3.08 7.66l3.16 2.64c.81-2.42 3.08-4.22 5.76-4.22Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function GoogleAuthButton({
  label = "Continue with Google",
  nextPath,
}: GoogleAuthButtonProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  function handleClick() {
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const redirectTo = buildBrowserAuthCallbackUrl(nextPath);
        const { data, error } = await supabase.auth.signInWithOAuth({
          options: {
            redirectTo,
          },
          provider: "google",
        });

        if (error) {
          setErrorMessage(toFriendlyGoogleError(error.message));
          return;
        }

        if (data.url) {
          window.location.assign(data.url);
        }
      } catch {
        setErrorMessage("Google sign-in could not start right now.");
      }
    });
  }

  return (
    <div className="space-y-3">
      <button
        className="inline-flex min-h-11 w-full items-center justify-center gap-3 rounded-full border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition hover:border-primary/20 hover:bg-card disabled:cursor-not-allowed disabled:border-border/70 disabled:text-muted-foreground"
        disabled={isPending}
        onClick={handleClick}
        type="button"
      >
        <GoogleMark />
        {isPending ? "Redirecting to Google..." : label}
      </button>

      {errorMessage ? (
        <p className="text-sm leading-7 text-destructive">{errorMessage}</p>
      ) : null}
    </div>
  );
}

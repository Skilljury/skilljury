"use client";

import { useMemo, useState, useTransition } from "react";

import { buildBrowserAuthCallbackUrl } from "@/lib/auth/browser";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type GitHubConnectButtonProps = {
  githubUsername: string | null;
  isLinked: boolean;
  nextPath: string;
};

export function GitHubConnectButton({
  githubUsername,
  isLinked,
  nextPath,
}: GitHubConnectButtonProps) {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConnect() {
    setErrorMessage(null);

    startTransition(async () => {
      const redirectTo = buildBrowserAuthCallbackUrl(nextPath);
      const { data, error } = await supabase.auth.linkIdentity({
        provider: "github",
        options: {
          redirectTo,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (data?.url) {
        window.location.assign(data.url);
      }
    });
  }

  return (
    <div className="space-y-3">
      <button
        className="rounded-full border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition-default hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:border-border disabled:text-muted-foreground"
        disabled={isLinked || isPending}
        onClick={handleConnect}
        type="button"
      >
        {isLinked
          ? `GitHub linked${githubUsername ? ` as ${githubUsername}` : ""}`
          : isPending
            ? "Redirecting to GitHub..."
            : "Link GitHub"}
      </button>

      {errorMessage ? (
        <p className="text-sm leading-7 text-destructive">{errorMessage}</p>
      ) : null}
    </div>
  );
}

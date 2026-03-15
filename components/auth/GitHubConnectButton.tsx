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
        className="rounded-full border border-white/10 bg-zinc-950/80 px-5 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:border-white/8 disabled:text-zinc-500"
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
        <p className="text-sm leading-7 text-rose-300">{errorMessage}</p>
      ) : null}
    </div>
  );
}

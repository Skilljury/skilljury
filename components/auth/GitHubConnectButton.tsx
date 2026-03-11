"use client";

import { useMemo, useState, useTransition } from "react";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type GitHubConnectButtonProps = {
  githubUsername: string | null;
  isLinked: boolean;
  redirectTo: string;
};

export function GitHubConnectButton({
  githubUsername,
  isLinked,
  redirectTo,
}: GitHubConnectButtonProps) {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConnect() {
    setErrorMessage(null);

    startTransition(async () => {
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
        className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
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
        <p className="text-sm leading-7 text-rose-700">{errorMessage}</p>
      ) : null}
    </div>
  );
}

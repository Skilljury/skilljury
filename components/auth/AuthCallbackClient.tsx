"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type AuthCallbackClientProps = {
  nextPath: string;
};

function readHashParams() {
  if (typeof window === "undefined") {
    return new URLSearchParams();
  }

  return new URLSearchParams(window.location.hash.replace(/^#/, ""));
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "SkillJury could not complete the sign-in flow.";
}

export function AuthCallbackClient({ nextPath }: AuthCallbackClientProps) {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [statusMessage, setStatusMessage] = useState(
    "Validating your sign-in link and preparing your reviewer session.",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function completeAuth() {
      try {
        const url = new URL(window.location.href);
        const searchParams = url.searchParams;
        const hashParams = readHashParams();
        const queryCode = searchParams.get("code");
        const queryError =
          searchParams.get("error_description") ?? searchParams.get("error");
        const hashError =
          hashParams.get("error_description") ?? hashParams.get("error");

        if (queryError || hashError) {
          throw new Error(queryError ?? hashError ?? "Magic link verification failed.");
        }

        if (queryCode) {
          const { error } = await supabase.auth.exchangeCodeForSession(queryCode);

          if (error) {
            throw error;
          }
        } else {
          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");

          if (!accessToken || !refreshToken) {
            throw new Error("The sign-in link did not include a valid session.");
          }

          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            throw error;
          }
        }

        setStatusMessage("Syncing your SkillJury reviewer profile.");

        const syncResponse = await fetch("/api/auth/sync-profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!syncResponse.ok) {
          const payload = (await syncResponse.json().catch(() => null)) as
            | { error?: string }
            | null;

          throw new Error(payload?.error ?? "SkillJury could not sync your profile.");
        }

        if (isActive) {
          router.replace(nextPath);
        }
      } catch (error) {
        if (!isActive) {
          return;
        }

        setErrorMessage(getErrorMessage(error));
      }
    }

    void completeAuth();

    return () => {
      isActive = false;
    };
  }, [nextPath, router, supabase]);

  if (errorMessage) {
    return (
      <div className="rounded-[1.75rem] border border-rose-200 bg-rose-50 p-6 text-sm leading-7 text-rose-900 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
        <div className="text-xs uppercase tracking-[0.24em] text-rose-500">
          Sign-in failed
        </div>
        <p className="mt-3">{errorMessage}</p>
        <p className="mt-3">
          Return to the{" "}
          <Link className="font-medium underline underline-offset-4" href="/login">
            login page
          </Link>{" "}
          and request a fresh magic link.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 text-sm leading-7 text-slate-700 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
      {statusMessage}
    </div>
  );
}

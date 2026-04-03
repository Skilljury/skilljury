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
    "Restoring your SkillJury session.",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    function isPkceVerifierMissing(error: unknown) {
      return (
        error instanceof Error &&
        error.message.includes("PKCE code verifier not found in storage")
      );
    }

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
        const authType = searchParams.get("type") ?? hashParams.get("type");

        if (queryError || hashError) {
          throw new Error(queryError ?? hashError ?? "SkillJury could not finish the auth flow.");
        }

        if (queryCode) {
          const { error } = await supabase.auth.exchangeCodeForSession(queryCode);

          if (error) {
            if (isPkceVerifierMissing(error)) {
              const {
                data: { session },
              } = await supabase.auth.getSession();

              if (session) {
                // Another auth handler already restored the session; continue normally.
              } else {
                throw new Error(
                  "SkillJury could not restore your Google session. Start the sign-in flow again from the same browser tab.",
                );
              }
            } else {
              throw error;
            }
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

        if (authType === "recovery") {
          if (isActive) {
            router.replace(`/reset-password?next=${encodeURIComponent(nextPath)}`);
          }

          return;
        }

        setStatusMessage("Syncing your SkillJury profile.");

        const syncResponse = await fetch("/api/auth/sync-profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const syncPayload = (await syncResponse.json().catch(() => null)) as
          | { error?: string; needsProfileSetup?: boolean }
          | null;

        if (!syncResponse.ok) {
          throw new Error(syncPayload?.error ?? "SkillJury could not sync your profile.");
        }

        if (isActive) {
          if (syncPayload?.needsProfileSetup) {
            router.replace(`/account/setup?next=${encodeURIComponent(nextPath)}`);
            return;
          }

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
      <div className="rounded-[1.5rem] border border-destructive/25 bg-destructive/5 p-6 text-sm leading-7 text-foreground shadow-sm">
        <div className="text-xs uppercase tracking-[0.24em] text-destructive">
          Auth failed
        </div>
        <p className="mt-3">{errorMessage}</p>
        <p className="mt-3">
          Return to the{" "}
          <Link
            className="font-medium text-foreground underline underline-offset-4 transition-default hover:text-primary"
            href="/login"
          >
            login page
          </Link>{" "}
          and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[1.5rem] border border-border bg-card/80 p-6 text-sm leading-7 text-muted-foreground shadow-sm">
      {statusMessage}
    </div>
  );
}

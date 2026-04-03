"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { Toast } from "@/components/ui/Toast";
import { buildBrowserAuthCallbackUrl } from "@/lib/auth/browser";
import { validateUsername } from "@/lib/auth/username";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type AuthPanelProps = {
  googleAuthEnabled: boolean;
  nextPath: string;
};

type AuthMode = "login" | "signup" | "reset";

function getModeCopy(googleAuthEnabled: boolean): Record<
  AuthMode,
  {
    heading: string;
    description: string;
    submitLabel: string;
  }
> {
  return {
    login: {
      description: googleAuthEnabled
        ? "Use Google or your email and password to continue."
        : "Use your email and password to continue.",
      heading: "Log in",
      submitLabel: "Log in",
    },
    reset: {
      description: "Enter your email and SkillJury will send a password reset link.",
      heading: "Reset password",
      submitLabel: "Send reset link",
    },
    signup: {
      description: googleAuthEnabled
        ? "Create a real SkillJury account with Google or with email, password, and a public ID."
        : "Create a real SkillJury account with email, password, and a public ID you can use on reviews and submissions.",
      heading: "Create account",
      submitLabel: "Create account",
    },
  };
}

export function AuthPanel({ googleAuthEnabled, nextPath }: AuthPanelProps) {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const modeCopy = useMemo(() => getModeCopy(googleAuthEnabled), [googleAuthEnabled]);
  const usernamePreview = validateUsername(username).normalized ?? "";

  async function completeSignedInFlow() {
    const response = await fetch("/api/auth/sync-profile", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    const payload = (await response.json().catch(() => null)) as
      | {
          error?: string;
          needsProfileSetup?: boolean;
        }
      | null;

    if (!response.ok) {
      throw new Error(payload?.error ?? "SkillJury could not sync your account.");
    }

    if (payload?.needsProfileSetup) {
      router.push(`/account/setup?next=${encodeURIComponent(nextPath)}`);
      router.refresh();
      return;
    }

    router.push(nextPath);
    router.refresh();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      try {
        if (mode === "login") {
          const { error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

          if (error) {
            throw error;
          }

          await completeSignedInFlow();
          return;
        }

        if (mode === "reset") {
          const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
            redirectTo: buildBrowserAuthCallbackUrl(nextPath),
          });

          if (error) {
            throw error;
          }

          setSuccessMessage("Check your inbox for the password reset email.");
          return;
        }

        const usernameResult = validateUsername(username);

        if (usernameResult.error || !usernameResult.normalized) {
          throw new Error(usernameResult.error ?? "Pick a valid username.");
        }

        if (password.length < 8) {
          throw new Error("Passwords must be at least 8 characters long.");
        }

        if (password !== confirmPassword) {
          throw new Error("Password confirmation does not match.");
        }

        const { count, error: usernameCheckError } = await supabase
          .from("user_profiles")
          .select("id", { count: "exact", head: true })
          .eq("username", usernameResult.normalized);

        if (usernameCheckError) {
          throw usernameCheckError;
        }

        if ((count ?? 0) > 0) {
          throw new Error("That username is already taken.");
        }

        const publicName = displayName.trim() || usernameResult.normalized;
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              display_name: publicName,
              full_name: publicName,
              name: publicName,
              user_name: usernameResult.normalized,
              username: usernameResult.normalized,
            },
            emailRedirectTo: buildBrowserAuthCallbackUrl(nextPath),
          },
        });

        if (error) {
          throw error;
        }

        if (data.session) {
          await completeSignedInFlow();
          return;
        }

        setSuccessMessage(
          "Your account was created. Confirm your email to finish activation.",
        );
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Auth failed.");
      }
    });
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 rounded-[2rem] border border-border bg-card/80 p-6 shadow-sm">
        <div className="inline-flex w-fit rounded-full border border-border bg-background p-1">
          {(["login", "signup", "reset"] as const).map((value) => (
            <button
              key={value}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                mode === value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => {
                setMode(value);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              type="button"
            >
              {value === "login"
                ? "Log in"
                : value === "signup"
                  ? "Sign up"
                  : "Reset password"}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">{modeCopy[mode].heading}</h2>
          <p className="text-sm leading-7 text-muted-foreground">{modeCopy[mode].description}</p>
        </div>

        {mode !== "reset" && googleAuthEnabled ? (
          <GoogleAuthButton nextPath={nextPath} />
        ) : null}

        {mode !== "reset" && !googleAuthEnabled ? (
          <div className="rounded-[1.5rem] border border-primary/20 bg-primary/10 px-4 py-3 text-sm leading-7 text-foreground">
            Google sign-in is being finalized for this deployment. Use email and
            password for now.
          </div>
        ) : null}

        {mode !== "reset" && googleAuthEnabled ? (
          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-4 text-xs uppercase tracking-[0.28em] text-muted-foreground">
                Or use email
              </span>
            </div>
          </div>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === "signup" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-foreground">Display name</span>
                <input
                  className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
                  maxLength={80}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="How your name appears publicly"
                  value={displayName}
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-foreground">Username / ID</span>
                <input
                  className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
                  maxLength={32}
                  minLength={3}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="your-id"
                  required
                  spellCheck={false}
                  value={username}
                />
                <span className="text-xs leading-6 text-muted-foreground">
                  Preview:{" "}
                  <span className="font-mono text-foreground">
                    {usernamePreview || "your-id"}
                  </span>
                </span>
              </label>
            </div>
          ) : null}

          <label className="grid gap-2">
            <span className="text-sm font-medium text-foreground">Email</span>
            <input
              autoComplete="email"
              className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              type="email"
              value={email}
            />
          </label>

          {mode !== "reset" ? (
            <label className="grid gap-2">
              <span className="text-sm font-medium text-foreground">Password</span>
              <input
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
                minLength={8}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                required
                type="password"
                value={password}
              />
            </label>
          ) : null}

          {mode === "signup" ? (
            <label className="grid gap-2">
              <span className="text-sm font-medium text-foreground">Confirm password</span>
              <input
                autoComplete="new-password"
                className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
                minLength={8}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repeat your password"
                required
                type="password"
                value={confirmPassword}
              />
            </label>
          ) : null}

          <button
            className="rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
            type="submit"
          >
            {isPending
              ? mode === "login"
                ? "Logging in..."
                : mode === "signup"
                  ? "Creating account..."
                  : "Sending reset email..."
              : modeCopy[mode].submitLabel}
          </button>
        </form>
      </div>

      {errorMessage ? <Toast message={errorMessage} tone="error" /> : null}
      {successMessage ? <Toast message={successMessage} tone="success" /> : null}
    </div>
  );
}

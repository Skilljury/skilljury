"use client";

import { useRouter } from "next/navigation";
import { useMemo, useTransition } from "react";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  function handleSignOut() {
    startTransition(async () => {
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    });
  }

  return (
    <button
      className="rounded-full border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition-default hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:text-muted-foreground"
      disabled={isPending}
      onClick={handleSignOut}
      type="button"
    >
      {isPending ? "Signing out..." : "Sign out"}
    </button>
  );
}

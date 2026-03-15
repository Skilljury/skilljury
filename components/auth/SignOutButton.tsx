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
      className="rounded-full border border-white/10 bg-zinc-950/80 px-5 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:text-zinc-500"
      disabled={isPending}
      onClick={handleSignOut}
      type="button"
    >
      {isPending ? "Signing out..." : "Sign out"}
    </button>
  );
}

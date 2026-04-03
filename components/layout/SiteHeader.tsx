import Link from "next/link";

import { SiteHeaderNav } from "@/components/layout/SiteHeaderNav";
import { getCurrentViewer } from "@/lib/auth/session";

export async function SiteHeader() {
  const viewer = await getCurrentViewer();
  const hasIdentity = Boolean(viewer.profile?.username);

  return (
    <header className="nav-blur sticky top-0 z-50 border-b border-border/70">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="group inline-flex items-center gap-3 text-sm font-semibold tracking-[-0.02em] text-foreground"
        >
          <span className="flex h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_0_6px_hsla(24,90%,58%,0.12)] transition-transform duration-200 group-hover:scale-110" />
          <span className="font-display text-[1.05rem] tracking-[-0.04em]">
            SkillJury
          </span>
        </Link>

        <SiteHeaderNav
          accountHref={viewer.user ? (hasIdentity ? "/account" : "/account/setup") : "/login"}
          accountLabel={viewer.user ? (hasIdentity ? "Account" : "Choose ID") : "Sign In"}
        />
      </div>
    </header>
  );
}

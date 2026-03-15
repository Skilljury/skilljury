import Link from "next/link";

import { SiteHeaderNav } from "@/components/layout/SiteHeaderNav";
import { getCurrentViewer } from "@/lib/auth/session";

export async function SiteHeader() {
  const viewer = await getCurrentViewer();
  const hasIdentity = Boolean(viewer.profile?.username);

  return (
    <header className="nav-blur sticky top-0 z-50 border-b border-border">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-mono text-xl font-semibold uppercase tracking-[0.28em]">
            <span className="gradient-wordmark">SkillJury</span>
          </Link>
        </div>

        <SiteHeaderNav
          accountHref={viewer.user ? (hasIdentity ? "/account" : "/account/setup") : "/login"}
          accountLabel={viewer.user ? (hasIdentity ? "Account" : "Choose ID") : "Sign In"}
        />
      </div>
    </header>
  );
}

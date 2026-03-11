import Link from "next/link";

import { SiteHeaderNav } from "@/components/layout/SiteHeaderNav";
import { getCurrentViewer } from "@/lib/auth/session";

export async function SiteHeader() {
  const viewer = await getCurrentViewer();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[rgba(7,10,18,0.78)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl border border-amber-300/30 bg-[radial-gradient(circle_at_top,#f7d48a,transparent_55%),linear-gradient(135deg,#1f2937,#0b1020)] text-lg font-semibold text-amber-100 shadow-[0_20px_45px_rgba(0,0,0,0.3)]">
              SJ
            </span>
            <div>
              <div className="font-display text-2xl tracking-tight text-white">
                SkillJury
              </div>
              <div className="text-xs uppercase tracking-[0.24em] text-slate-400">
                Review and discovery
              </div>
            </div>
          </Link>
        </div>

        <SiteHeaderNav
          accountHref={viewer.user ? "/account" : "/login"}
          accountLabel={viewer.user ? "Account" : "Sign in"}
        />
      </div>
    </header>
  );
}

import Link from "next/link";

export function SiteHeaderFallback() {
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
        <div className="h-9 w-24 animate-pulse rounded-full bg-muted/40" aria-hidden="true" />
      </div>
    </header>
  );
}

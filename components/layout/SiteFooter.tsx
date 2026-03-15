import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-6 py-12 text-[11px] uppercase tracking-[0.32em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 SkillJury. Public review layer for AI agent skills.</p>
        <div className="flex flex-wrap gap-x-5 gap-y-3">
          <Link className="transition-default hover:text-foreground" href="/terms">
            Terms
          </Link>
          <Link className="transition-default hover:text-foreground" href="/privacy">
            Privacy
          </Link>
          <Link className="transition-default hover:text-foreground" href="/submit-skill">
            Submit skill
          </Link>
        </div>
      </div>
    </footer>
  );
}

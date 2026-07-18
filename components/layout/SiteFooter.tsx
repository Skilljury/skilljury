import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border/70">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-6 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl leading-6">
          SkillJury. Read-only recovery catalog for AI agent skills.
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-3">
          <Link className="transition-default hover:text-foreground hover:underline underline-offset-4" href="/terms">
            Terms
          </Link>
          <Link className="transition-default hover:text-foreground hover:underline underline-offset-4" href="/privacy">
            Privacy
          </Link>
          <Link className="transition-default hover:text-foreground hover:underline underline-offset-4" href="/search">
            Search snapshot
          </Link>
        </div>
      </div>
    </footer>
  );
}

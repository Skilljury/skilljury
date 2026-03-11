import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/80">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-slate-400 lg:px-10">
        <p className="max-w-3xl">
          SkillJury is building the public trust layer for AI agent skills with
          structured reviews, moderation, public submissions, and machine-readable
          catalog pages.
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-300">
          <Link href="/about">About</Link>
          <Link href="/submit-skill">Submit skill</Link>
          <Link href="/how-scores-work">How scoring works</Link>
          <Link href="/review-guidelines">Review guidelines</Link>
          <Link href="/moderation-policy">Moderation policy</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </div>
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
          Sponsored placement will always stay separate from organic rankings.
        </p>
      </div>
    </footer>
  );
}

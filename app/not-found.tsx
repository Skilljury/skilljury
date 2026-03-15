import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-4xl items-center px-6 py-16 lg:px-10">
      <div className="rounded-xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_30%),linear-gradient(135deg,rgba(20,20,24,0.98),rgba(8,8,10,0.96))] p-10 shadow-xl">
        <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">
          Missing route
        </div>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-white">
          The requested page is not in the catalog.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-zinc-300">
          SkillJury exposes the live catalog and imported skill pages. If you
          expected a skill route here, the import may not have run yet.
        </p>
        <Link
          className="mt-8 inline-flex rounded-full bg-white px-5 py-3 text-sm font-medium text-zinc-950 transition hover:bg-zinc-100"
          href="/"
        >
          Back to the catalog
        </Link>
      </div>
    </div>
  );
}

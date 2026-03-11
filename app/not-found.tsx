import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-4xl items-center px-6 py-16 lg:px-10">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-[0_30px_80px_rgba(15,23,42,0.1)]">
        <div className="text-xs uppercase tracking-[0.3em] text-slate-500">
          Missing route
        </div>
        <h1 className="mt-4 font-display text-5xl tracking-tight text-slate-950">
          The requested page is not in the catalog.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
          SkillJury Phase 1 exposes the live catalog and imported skill pages.
          If you expected a skill route here, the import may not have run yet.
        </p>
        <Link
          className="mt-8 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          href="/"
        >
          Back to the catalog
        </Link>
      </div>
    </div>
  );
}

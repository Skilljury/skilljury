import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-4xl items-center px-6 py-16 lg:px-10">
      <div className="rounded-[2rem] border border-border bg-card/80 p-10 shadow-sm">
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Missing route
        </div>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-foreground">
          The requested page is not in the catalog.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-muted-foreground">
          SkillJury exposes the live catalog and imported skill pages. If you
          expected a skill route here, the import may not have run yet.
        </p>
        <Link
          className="mt-8 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-default hover:bg-primary/90"
          href="/"
        >
          Back to the catalog
        </Link>
      </div>
    </div>
  );
}

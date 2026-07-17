"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function SourcePageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Source page failed to render", {
      digest: error.digest,
      message: error.message,
    });
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center px-6 py-16 lg:px-10">
      <section className="w-full rounded-[2rem] border border-border bg-card/80 p-8 shadow-sm sm:p-10">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">
          Temporary source-page error
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          This source page did not load cleanly.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          The catalog is still available. Retry the request, browse all sources, or search for the skill directly.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={reset}
            type="button"
          >
            Try again
          </button>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            href="/sources"
          >
            Browse sources
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            href="/search"
          >
            Search skills
          </Link>
        </div>
      </section>
    </main>
  );
}

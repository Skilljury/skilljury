import Link from "next/link";

type EmptyStatePromptProps = {
  actionHref?: string;
  actionLabel?: string;
  description: string;
  title: string;
};

export function EmptyStatePrompt({
  actionHref,
  actionLabel,
  description,
  title,
}: EmptyStatePromptProps) {
  return (
    <div className="rounded-lg border border-dashed border-white/12 bg-white/[0.03] p-6 text-sm leading-7 text-zinc-500 shadow-md">
      <h2 className="font-mono text-[11px] uppercase tracking-[0.28em] text-zinc-500">
        {title}
      </h2>
      <p className="mt-3">{description}</p>
      {actionHref && actionLabel ? (
        <Link
          className="mt-4 inline-flex rounded-full bg-white px-5 py-3 text-sm font-medium text-zinc-950 transition hover:bg-zinc-100"
          href={actionHref}
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

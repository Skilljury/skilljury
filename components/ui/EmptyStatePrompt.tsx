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
    <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white/80 p-6 text-sm leading-7 text-slate-600 shadow-[0_20px_55px_rgba(15,23,42,0.04)]">
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      <p className="mt-3">{description}</p>
      {actionHref && actionLabel ? (
        <Link
          className="mt-4 inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          href={actionHref}
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

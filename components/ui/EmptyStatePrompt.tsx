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
    <div className="rounded-[1.75rem] border border-dashed border-border bg-card/45 p-6 text-sm leading-7 text-muted-foreground">
      <h2 className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
        {title}
      </h2>
      <p className="mt-3">{description}</p>
      {actionHref && actionLabel ? (
        <Link
          className="mt-4 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-95"
          href={actionHref}
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

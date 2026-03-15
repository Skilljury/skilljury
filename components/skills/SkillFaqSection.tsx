import Link from "next/link";

type SkillFaqSectionProps = {
  faqs: Array<{
    answer: string;
    question: string;
  }>;
  alternatives: Array<{
    name: string;
    slug: string;
  }>;
};

export function SkillFaqSection({
  faqs,
  alternatives,
}: SkillFaqSectionProps) {
  return (
    <section className="rounded-lg border border-border bg-card/70 p-6">
      <div className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground">
        FAQ
      </div>
      <div className="mt-5 space-y-4">
        {faqs.map((faq) => (
          <details
            key={faq.question}
            className="group rounded-lg border border-border bg-background/80 p-4"
          >
            <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
              <span>{faq.question}</span>
              <svg
                className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </summary>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{faq.answer}</p>
          </details>
        ))}
      </div>

      {alternatives.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-3">
          {alternatives.map((alternative) => (
            <Link
              key={alternative.slug}
              className="rounded-lg border border-border bg-secondary px-4 py-2 text-sm text-secondary-foreground transition-default hover:bg-surface-hover"
              href={`/skills/${alternative.slug}`}
            >
              {alternative.name}
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}

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
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
      <div className="text-xs uppercase tracking-[0.28em] text-slate-500">FAQ</div>
      <div className="mt-5 space-y-4">
        {faqs.map((faq) => (
          <details
            key={faq.question}
            className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4"
          >
            <summary className="cursor-pointer text-sm font-semibold text-slate-950">
              {faq.question}
            </summary>
            <p className="mt-3 text-sm leading-7 text-slate-700">{faq.answer}</p>
          </details>
        ))}
      </div>

      {alternatives.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-3">
          {alternatives.map((alternative) => (
            <Link
              key={alternative.slug}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
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

type PolicySection = {
  body: string[];
  title: string;
};

type PolicyPageLayoutProps = {
  intro: string;
  sections: PolicySection[];
  title: string;
};

export function PolicyPageLayout({
  intro,
  sections,
  title,
}: PolicyPageLayoutProps) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10 lg:px-10 lg:py-14">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
        <div className="text-xs uppercase tracking-[0.28em] text-slate-500">
          Trust and policies
        </div>
        <h1 className="mt-4 font-display text-5xl tracking-tight text-slate-950">
          {title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">{intro}</p>
      </section>

      <div className="space-y-6">
        {sections.map((section) => (
          <section
            key={section.title}
            className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_rgba(15,23,42,0.08)]"
          >
            <h2 className="text-2xl font-semibold text-slate-950">
              {section.title}
            </h2>
            <div className="mt-4 space-y-4 text-sm leading-7 text-slate-700">
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

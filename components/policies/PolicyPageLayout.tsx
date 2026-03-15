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
      <section className="rounded-xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.1),transparent_35%),linear-gradient(135deg,rgba(20,20,24,0.98),rgba(8,8,10,0.96))] p-7 shadow-xl">
        <div className="text-xs uppercase tracking-[0.28em] text-zinc-500">
          Trust and policies
        </div>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-white">
          {title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-zinc-300">{intro}</p>
      </section>

      <div className="space-y-6">
        {sections.map((section) => (
          <section
            key={section.title}
            className="rounded-xl border border-white/10 bg-white/[0.04] p-6 shadow-md"
          >
            <h2 className="text-2xl font-semibold text-white">
              {section.title}
            </h2>
            <div className="mt-4 space-y-4 text-sm leading-7 text-zinc-300">
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

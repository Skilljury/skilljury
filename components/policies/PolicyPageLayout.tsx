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
      <section className="rounded-[2rem] border border-border bg-card/80 p-7 shadow-sm">
        <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
          Trust and policies
        </div>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground">
          {intro}
        </p>
      </section>

      <div className="space-y-6">
        {sections.map((section) => (
          <section
            key={section.title}
            className="rounded-[1.5rem] border border-border bg-card/80 p-6 shadow-sm"
          >
            <h2 className="text-2xl font-semibold text-foreground">
              {section.title}
            </h2>
            <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground">
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

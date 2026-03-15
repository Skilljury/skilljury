import Link from "next/link";

import { encodeSourceSlug } from "@/lib/routing/sourceSlug";

type TaxonomyLinksProps = {
  categories: Array<{
    name: string;
    slug: string;
  }>;
  agents: Array<{
    name: string;
    slug: string;
  }>;
  source: {
    name: string;
    slug: string;
  } | null;
};

function PillLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-secondary-foreground transition-default hover:bg-surface-hover"
      href={href}
    >
      {label}
    </Link>
  );
}

export function TaxonomyLinks({
  categories,
  agents,
  source,
}: TaxonomyLinksProps) {
  const sections = [
    categories.length > 0
      ? {
          title: "Categories",
          content: (
            <div className="mt-3 flex flex-wrap gap-3">
              {categories.map((category) => (
                <PillLink
                  key={category.slug}
                  href={`/categories/${category.slug}`}
                  label={category.name}
                />
              ))}
            </div>
          ),
        }
      : null,
    agents.length > 0
      ? {
          title: "Agents",
          content: (
            <div className="mt-3 flex flex-wrap gap-3">
              {agents.map((agent) => (
                <PillLink
                  key={agent.slug}
                  href={`/agents/${agent.slug}`}
                  label={agent.name}
                />
              ))}
            </div>
          ),
        }
      : null,
    source
      ? {
          title: "Source",
          content: (
            <div className="mt-3">
              <PillLink
                href={`/sources/${encodeSourceSlug(source.slug)}`}
                label={source.name}
              />
            </div>
          ),
        }
      : null,
  ].filter(Boolean) as Array<{ title: string; content: React.ReactNode }>;

  if (sections.length === 0) {
    return null;
  }

  return (
    <section className="rounded-lg border border-border bg-card/70 p-6">
      <div className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground">
        Browse this skill in context
      </div>

      <div className="mt-5 space-y-5">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="text-sm font-semibold text-foreground">{section.title}</h2>
            {section.content}
          </div>
        ))}
      </div>
    </section>
  );
}

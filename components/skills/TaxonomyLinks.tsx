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
      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
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
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
      <div className="text-xs uppercase tracking-[0.28em] text-slate-500">
        Browse this skill in context
      </div>

      <div className="mt-5 space-y-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-950">Categories</h2>
          <div className="mt-3 flex flex-wrap gap-3">
            {categories.length > 0 ? (
              categories.map((category) => (
                <PillLink
                  key={category.slug}
                  href={`/categories/${category.slug}`}
                  label={category.name}
                />
              ))
            ) : (
              <span className="text-sm text-slate-500">
                Category links are not available for this skill yet.
              </span>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-950">Agents</h2>
          <div className="mt-3 flex flex-wrap gap-3">
            {agents.length > 0 ? (
              agents.map((agent) => (
                <PillLink
                  key={agent.slug}
                  href={`/agents/${agent.slug}`}
                  label={agent.name}
                />
              ))
            ) : (
              <span className="text-sm text-slate-500">
                Agent links are not available for this skill yet.
              </span>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-950">Source</h2>
          <div className="mt-3">
            {source ? (
              <PillLink
                href={`/sources/${encodeSourceSlug(source.slug)}`}
                label={source.name}
              />
            ) : (
              <span className="text-sm text-slate-500">
                Source context is not available for this skill yet.
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

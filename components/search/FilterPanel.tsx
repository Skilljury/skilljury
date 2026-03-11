import { SortSelect } from "@/components/listing/SortSelect";
import type { SearchSort } from "@/lib/db/search";

type FilterOption = {
  slug: string;
  name: string;
};

type FilterPanelProps = {
  selectedCategory?: string;
  selectedAgent?: string;
  selectedSource?: string;
  sort: SearchSort;
  categories: FilterOption[];
  agents: FilterOption[];
  sources: FilterOption[];
};

export function FilterPanel({
  selectedCategory = "",
  selectedAgent = "",
  selectedSource = "",
  sort,
  categories,
  agents,
  sources,
}: FilterPanelProps) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="grid gap-2">
          <span className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
            Category
          </span>
          <select
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:bg-white"
            defaultValue={selectedCategory}
            name="category"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
            Agent
          </span>
          <select
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:bg-white"
            defaultValue={selectedAgent}
            name="agent"
          >
            <option value="">All agents</option>
            {agents.map((agent) => (
              <option key={agent.slug} value={agent.slug}>
                {agent.name}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
            Source
          </span>
          <select
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:bg-white"
            defaultValue={selectedSource}
            name="source"
          >
            <option value="">All sources</option>
            {sources.map((source) => (
              <option key={source.slug} value={source.slug}>
                {source.name}
              </option>
            ))}
          </select>
        </label>

        <SortSelect value={sort} />
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          type="submit"
        >
          Apply filters
        </button>
        <a
          className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-white"
          href="/search"
        >
          Reset
        </a>
      </div>
    </div>
  );
}

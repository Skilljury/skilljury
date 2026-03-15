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
    <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-card/70 p-5">
      <div className="mb-4">
        <div className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground">
          Filters
        </div>
        <h2 className="mt-3 text-lg font-semibold text-foreground">Refine results</h2>
      </div>
      <div className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            Category
          </span>
          <select
            className="w-full min-w-0 rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground transition-default focus:border-white/20"
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
          <span className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            Agent
          </span>
          <select
            className="w-full min-w-0 rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground transition-default focus:border-white/20"
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
          <span className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            Source
          </span>
          <select
            className="w-full min-w-0 rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground transition-default focus:border-white/20"
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
          className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-card px-4 text-[11px] uppercase tracking-[0.28em] text-foreground transition-default hover:border-white/20 hover:bg-surface-hover"
          type="submit"
        >
          Apply filters
        </button>
        <a
          className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition-default hover:bg-surface-hover hover:text-foreground"
          href="/search"
        >
          Reset
        </a>
      </div>
    </div>
  );
}

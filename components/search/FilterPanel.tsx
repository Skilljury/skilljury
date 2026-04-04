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
    <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <label className="grid gap-2">
        <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Category
        </span>
        <select
          className="w-full min-w-[10rem] rounded-xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground transition-default focus:border-primary/30 focus:outline-none"
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
        <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Agent
        </span>
        <select
          className="w-full min-w-[10rem] rounded-xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground transition-default focus:border-primary/30 focus:outline-none"
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
        <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Source
        </span>
        <select
          className="w-full min-w-[10rem] rounded-xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground transition-default focus:border-primary/30 focus:outline-none"
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

      <div className="flex flex-wrap items-center gap-3 sm:col-span-2 xl:col-span-4">
        <button
        className="inline-flex h-11 items-center justify-center rounded-full border border-primary/20 bg-primary px-5 text-[11px] uppercase tracking-[0.26em] text-primary-foreground transition-default hover:opacity-90 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
          type="submit"
        >
          Apply
        </button>
        <a
        className="inline-flex h-11 items-center justify-center rounded-full border border-border px-5 text-[11px] uppercase tracking-[0.26em] text-muted-foreground transition-default hover:border-primary/20 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
          href="/search"
        >
          Reset
        </a>
      </div>
    </div>
  );
}

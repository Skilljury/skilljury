import { FilterPanel } from "@/components/search/FilterPanel";
import type { SearchSort } from "@/lib/db/search";

type FilterOption = {
  slug: string;
  name: string;
};

type SearchBarProps = {
  agents: FilterOption[];
  categories: FilterOption[];
  defaultValue?: string;
  selectedAgent?: string;
  selectedCategory?: string;
  selectedSource?: string;
  sort: SearchSort;
  sources: FilterOption[];
};

export function SearchBar({
  agents,
  categories,
  defaultValue = "",
  selectedAgent = "",
  selectedCategory = "",
  selectedSource = "",
  sort,
  sources,
}: SearchBarProps) {
  return (
    <section className="search-glow rounded-2xl border border-border bg-card/75 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.14)] transition-default sm:p-5">
      <div className="flex flex-col gap-3 border-b border-border/70 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            Search rail
          </div>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-foreground">
            Search the live catalog
          </h2>
        </div>
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
          Search, filter, and compare in one rail. Keep the result set dense and
          comparable.
        </p>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <label className="grid gap-2">
          <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Search
          </span>
      <div className="flex items-center gap-3 rounded-xl border border-border bg-background/70 px-4 py-3 transition-default focus-within:border-primary/30">
            <div className="pointer-events-none text-muted-foreground">
              <svg
                fill="none"
                height="18"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="18"
              >
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              defaultValue={defaultValue}
              name="q"
              placeholder="Search skills, repos, or use cases"
              type="search"
            />
          </div>
        </label>

        <FilterPanel
          agents={agents}
          categories={categories}
          selectedAgent={selectedAgent}
          selectedCategory={selectedCategory}
          selectedSource={selectedSource}
          sort={sort}
          sources={sources}
        />
      </div>
    </section>
  );
}

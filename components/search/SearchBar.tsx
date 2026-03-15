type SearchBarProps = {
  defaultValue?: string;
};

export function SearchBar({ defaultValue = "" }: SearchBarProps) {
  return (
    <div className="search-glow rounded-xl border border-border bg-card/80 p-3 transition-default">
      <label className="block">
        <span className="text-[11px] uppercase tracking-[0.34em] text-muted-foreground">
          Search the catalog
        </span>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground">
              <svg fill="none" height="18" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="18">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              className="h-12 w-full min-w-0 rounded-lg border border-border bg-background px-12 py-3 text-sm text-foreground transition-default placeholder:text-muted-foreground focus:border-white/20"
              defaultValue={defaultValue}
              name="q"
              placeholder="Search by skill, repo, or problem space"
              type="search"
            />
          </div>
          <button
            className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-default hover:opacity-90"
            type="submit"
          >
            Search
          </button>
        </div>
      </label>
    </div>
  );
}

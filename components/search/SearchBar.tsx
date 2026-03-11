type SearchBarProps = {
  defaultValue?: string;
};

export function SearchBar({ defaultValue = "" }: SearchBarProps) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
      <label className="block">
        <span className="text-[11px] uppercase tracking-[0.26em] text-slate-400">
          Search the catalog
        </span>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:bg-white"
            defaultValue={defaultValue}
            name="q"
            placeholder="Search by skill, repo, or problem space"
            type="search"
          />
          <button
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            type="submit"
          >
            Search
          </button>
        </div>
      </label>
    </div>
  );
}

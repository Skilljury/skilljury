import type { SearchSort } from "@/lib/db/search";

type SortSelectProps = {
  name?: string;
  value: SearchSort;
  options?: Array<{
    value: SearchSort;
    label: string;
  }>;
};

const defaultOptions: Array<{ value: SearchSort; label: string }> = [
  { value: "popular", label: "Most popular" },
  { value: "trending", label: "Trending" },
  { value: "newest", label: "Newest" },
  { value: "alphabetical", label: "Alphabetical" },
  { value: "top-rated", label: "Top rated" },
];

export function SortSelect({
  name = "sort",
  value,
  options = defaultOptions,
}: SortSelectProps) {
  return (
    <label className="grid gap-2">
      <span className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
        Sort
      </span>
      <select
        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:bg-white"
        defaultValue={value}
        name={name}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

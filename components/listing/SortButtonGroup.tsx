import Link from "next/link";

import type { SearchSort } from "@/lib/db/search";

type SortButtonGroupProps = {
  basePath: string;
  value: SearchSort;
};

const options: Array<{ label: string; value: SearchSort }> = [
  { label: "Most Installed", value: "popular" },
  { label: "Top Rated", value: "top-rated" },
  { label: "Most Recent", value: "newest" },
];

function buildSortHref(basePath: string, sort: SearchSort) {
  if (sort === "popular") {
    return basePath;
  }

  return `${basePath}?sort=${encodeURIComponent(sort)}`;
}

export function SortButtonGroup({
  basePath,
  value,
}: SortButtonGroupProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={`transition-default rounded-lg px-4 py-2 text-sm font-medium ${
              isActive
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            href={buildSortHref(basePath, option.value)}
            key={option.value}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}

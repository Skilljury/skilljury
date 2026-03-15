import Link from "next/link";

type PaginationNavProps = {
  basePath: string;
  page: number;
  totalPages: number;
  query?: Record<string, string | number | undefined>;
};

function buildHref(
  basePath: string,
  page: number,
  query: Record<string, string | number | undefined> = {},
) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });

  if (page > 1) {
    params.set("page", String(page));
  }

  const queryString = params.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

export function PaginationNav({
  basePath,
  page,
  totalPages,
  query,
}: PaginationNavProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col items-start justify-between gap-4 rounded-lg border border-border bg-card/70 p-5 text-sm text-muted-foreground sm:flex-row sm:items-center">
      <div className="font-mono">
        Page {page} of {totalPages}
      </div>
      <div className="flex items-center gap-3">
        {page > 1 ? (
          <Link
            className="rounded-lg border border-border px-4 py-2 transition-default hover:bg-surface-hover hover:text-foreground"
            href={buildHref(basePath, page - 1, query)}
          >
            Previous
          </Link>
        ) : null}
        {page < totalPages ? (
          <Link
            className="rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-default hover:opacity-90"
            href={buildHref(basePath, page + 1, query)}
          >
            Next
          </Link>
        ) : null}
      </div>
    </div>
  );
}

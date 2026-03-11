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
    <div className="flex flex-col items-start justify-between gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-5 text-sm text-slate-700 shadow-[0_20px_55px_rgba(15,23,42,0.08)] sm:flex-row sm:items-center">
      <div>
        Page {page} of {totalPages}
      </div>
      <div className="flex items-center gap-3">
        {page > 1 ? (
          <a
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 transition hover:border-slate-300 hover:bg-white"
            href={buildHref(basePath, page - 1, query)}
          >
            Previous
          </a>
        ) : null}
        {page < totalPages ? (
          <a
            className="rounded-full bg-slate-950 px-4 py-2 text-white transition hover:bg-slate-800"
            href={buildHref(basePath, page + 1, query)}
          >
            Next
          </a>
        ) : null}
      </div>
    </div>
  );
}

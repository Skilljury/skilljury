import type { SearchSort } from "@/lib/db/search";

type RawParamValue = string | string[] | undefined;

export function firstParam(value: RawParamValue) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export function normalizePageParam(value: RawParamValue) {
  const parsed = Number.parseInt(firstParam(value), 10);

  if (Number.isNaN(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

export function normalizeSortParam(value: RawParamValue): SearchSort {
  const raw = firstParam(value);

  if (
    raw === "popular" ||
    raw === "newest" ||
    raw === "alphabetical" ||
    raw === "top-rated" ||
    raw === "trending"
  ) {
    return raw;
  }

  return "popular";
}

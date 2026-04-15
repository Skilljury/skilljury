import { NextResponse } from "next/server";

import { getLeaderboardSkills } from "@/lib/db/skills";

function parseTab(value: string | null) {
  if (value === "trending" || value === "hot") {
    return value;
  }

  return "all";
}

function parsePositiveInteger(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tab = parseTab(searchParams.get("tab"));
  const page = parsePositiveInteger(searchParams.get("page"), 1);
  const pageSize = Math.min(parsePositiveInteger(searchParams.get("pageSize"), 25), 100);

  const data = await getLeaderboardSkills(tab, page, pageSize);

  return NextResponse.json(data, {
    headers: {
      "cache-control": "public, max-age=60, s-maxage=300, stale-while-revalidate=3600",
    },
  });
}

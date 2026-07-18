import { NextResponse } from "next/server";

const RECOVERY_HEALTH_URL =
  "https://yqalyaaetcwrhkmxivbh.supabase.co/functions/v1/skilljury-catalog-health";

export async function GET() {
  try {
    const response = await fetch(RECOVERY_HEALTH_URL, {
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
    const body = await response.json().catch(() => null);

    return NextResponse.json(
      {
        ok: response.ok && body?.ok === true,
        upstreamStatus: response.status,
        skillCount: body?.skillCount ?? null,
      },
      { status: response.ok ? 200 : 503 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 503 },
    );
  }
}

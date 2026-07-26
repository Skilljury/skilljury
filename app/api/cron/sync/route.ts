import { NextRequest, NextResponse } from "next/server";

import { routeErrorResponse } from "@/lib/errors/routeError";
import { runSkillsShSync } from "@/lib/ingestion/syncSkillsSh";

export const maxDuration = 300;

// SkillJury is intentionally serving the verified read-only snapshot while the
// live Supabase project is restricted. Set this to false only as part of the
// provider-restoration change after live write verification succeeds.
const RECOVERY_MODE_ACTIVE = true;

function getCronSecret() {
  return process.env.CRON_SECRET?.trim() || null;
}

function isAuthorized(request: NextRequest, expectedSecret: string) {
  return request.headers.get("authorization") === `Bearer ${expectedSecret}`;
}

export async function GET(request: NextRequest) {
  const expectedSecret = getCronSecret();

  if (!expectedSecret) {
    return NextResponse.json(
      { error: "Cron sync is not configured for this environment." },
      { status: 503 },
    );
  }

  if (!isAuthorized(request, expectedSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (RECOVERY_MODE_ACTIVE) {
    return NextResponse.json({
      skipped: true,
      reason: "provider-restricted",
    });
  }

  const limitParam = request.nextUrl.searchParams.get("limit");
  const parsedLimit = limitParam ? Number.parseInt(limitParam, 10) : undefined;

  try {
    const summary = await runSkillsShSync({
      trigger: "cron",
      limit:
        typeof parsedLimit === "number" && !Number.isNaN(parsedLimit)
          ? Math.min(Math.max(parsedLimit, 1), 500)
          : undefined,
    });

    return NextResponse.json(summary);
  } catch (error) {
    return routeErrorResponse(error, {
      context: "cron-sync",
      fallbackMessage: "Skill sync failed.",
    });
  }
}

import { NextRequest, NextResponse } from "next/server";

import { getCurrentViewer } from "@/lib/auth/session";
import { AppError } from "@/lib/errors/appError";
import { createReport, type ReportReason } from "@/lib/reports/createReport";

type ReportRequestBody = {
  notes?: string | null;
  reason?: ReportReason;
  targetId?: string;
  targetType?: "review" | "skill";
  turnstileToken?: string;
};

export async function POST(request: NextRequest) {
  try {
    const viewer = await getCurrentViewer();

    if (!viewer.user) {
      throw new AppError(401, "You must sign in before filing a report.", "unauthorized");
    }

    const body = (await request.json()) as ReportRequestBody;

    if (!body.reason || !body.targetId || !body.targetType || !body.turnstileToken) {
      throw new AppError(400, "Report target, reason, and Turnstile are required.", "invalid_payload");
    }

    const forwardedFor = request.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor?.split(",")[0]?.trim() ?? null;
    const result = await createReport({
      ipAddress,
      notes: body.notes ?? null,
      reason: body.reason,
      targetId: body.targetId,
      targetType: body.targetType,
      turnstileToken: body.turnstileToken,
      userId: viewer.user.id,
      userStatus: viewer.profile?.accountStatus ?? "active",
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown report failure.",
      },
      { status: 500 },
    );
  }
}

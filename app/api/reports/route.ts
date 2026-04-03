import { NextRequest, NextResponse } from "next/server";

import { getCurrentViewer } from "@/lib/auth/session";
import { AppError } from "@/lib/errors/appError";
import { routeErrorResponse } from "@/lib/errors/routeError";
import {
  createReport,
  REPORT_REASONS,
  REPORT_TARGET_TYPES,
  type ReportReason,
} from "@/lib/reports/createReport";

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
    const targetId = body.targetId?.trim();

    if (!body.turnstileToken || !targetId) {
      throw new AppError(400, "Report target, reason, and Turnstile are required.", "invalid_payload");
    }

    if (!REPORT_REASONS.includes(body.reason as ReportReason)) {
      throw new AppError(400, "Select a valid report reason.", "invalid_reason");
    }

    if (!REPORT_TARGET_TYPES.includes(body.targetType as "review" | "skill")) {
      throw new AppError(400, "Select a valid report target.", "invalid_target_type");
    }

    const forwardedFor = request.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor?.split(",")[0]?.trim() ?? null;
    const result = await createReport({
      ipAddress,
      notes: body.notes ?? null,
      reason: body.reason as ReportReason,
      targetId,
      targetType: body.targetType as "review" | "skill",
      turnstileToken: body.turnstileToken,
      userId: viewer.user.id,
      userStatus: viewer.profile?.accountStatus ?? "active",
    });

    return NextResponse.json(result);
  } catch (error) {
    return routeErrorResponse(error, {
      context: "create-report",
      fallbackMessage: "SkillJury could not submit this report right now.",
    });
  }
}

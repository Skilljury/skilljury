import { NextRequest, NextResponse } from "next/server";

import { getCurrentViewer } from "@/lib/auth/session";
import { trackServerEvent } from "@/lib/analytics/events";
import { AppError } from "@/lib/errors/appError";
import { createReviewRequest } from "@/lib/skills/reviewRequests";

type ReviewRequestBody = {
  skillSlug?: string;
};

export async function POST(request: NextRequest) {
  try {
    const viewer = await getCurrentViewer();

    if (!viewer.user) {
      throw new AppError(
        401,
        "You must sign in before requesting a review.",
        "unauthorized",
      );
    }

    if (
      viewer.profile?.accountStatus === "suspended" ||
      viewer.profile?.accountStatus === "banned"
    ) {
      throw new AppError(
        403,
        "This account cannot request reviews right now.",
        "account_blocked",
      );
    }

    const body = (await request.json()) as ReviewRequestBody;

    const skillSlug = body.skillSlug?.trim();

    if (!skillSlug) {
      throw new AppError(400, "Skill slug is required.", "invalid_payload");
    }

    const result = await createReviewRequest({
      skillSlug,
      userId: viewer.user.id,
    });

    trackServerEvent("request_review_clicked", {
      skillId: result.skillId,
      skillSlug: result.skillSlug,
      userId: viewer.user.id,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown request-review failure.",
      },
      { status: 500 },
    );
  }
}

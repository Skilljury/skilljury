import { NextRequest, NextResponse } from "next/server";

import { getCurrentViewer } from "@/lib/auth/session";
import { AppError } from "@/lib/errors/appError";
import { routeErrorResponse } from "@/lib/errors/routeError";
import { prefillFromUrl } from "@/lib/submissions/prefillFromUrl";
import { enforceSubmissionPrefillRateLimits } from "@/lib/submissions/prefillRateLimits";

type SubmissionPrefillBody = {
  repositoryUrl?: string | null;
  sourceUrl?: string | null;
};

export async function POST(request: NextRequest) {
  try {
    const viewer = await getCurrentViewer();

    if (!viewer.user) {
      throw new AppError(
        401,
        "You must sign in before pre-filling a submission.",
        "unauthorized",
      );
    }

    if (!viewer.profile?.username) {
      throw new AppError(
        403,
        "Finish your SkillJury profile before using repository prefill.",
        "profile_incomplete",
      );
    }

    const body = (await request.json()) as SubmissionPrefillBody;

    if (!body.repositoryUrl) {
      throw new AppError(400, "Repository URL is required.", "repository_required");
    }

    const forwardedFor = request.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor?.split(",")[0]?.trim() ?? null;

    await enforceSubmissionPrefillRateLimits({
      ipAddress,
      userId: viewer.user.id,
      userStatus: viewer.profile?.accountStatus ?? "active",
    });

    const prefill = await prefillFromUrl({
      repositoryUrl: body.repositoryUrl,
      sourceUrl: body.sourceUrl ?? null,
    });

    return NextResponse.json({ prefill });
  } catch (error) {
    return routeErrorResponse(error, {
      context: "submission-prefill",
      fallbackMessage: "SkillJury could not prefill this repository right now.",
    });
  }
}

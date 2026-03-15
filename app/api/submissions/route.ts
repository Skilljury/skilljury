import { NextRequest, NextResponse } from "next/server";

import { getCurrentViewer } from "@/lib/auth/session";
import { AppError } from "@/lib/errors/appError";
import { createSubmission } from "@/lib/submissions/createSubmission";

type SubmissionRequestBody = {
  proposedCategory?: string | null;
  proposedName?: string | null;
  proposedSummary?: string | null;
  repositoryUrl?: string | null;
  sourceUrl?: string | null;
  turnstileToken?: string;
};

export async function POST(request: NextRequest) {
  try {
    const viewer = await getCurrentViewer();

    if (!viewer.user) {
      throw new AppError(401, "You must sign in before submitting a skill.", "unauthorized");
    }

    if (!viewer.profile?.username) {
      throw new AppError(
        403,
        "Finish your SkillJury profile before submitting a skill.",
        "profile_incomplete",
      );
    }

    const body = (await request.json()) as SubmissionRequestBody;

    if (!body.turnstileToken) {
      throw new AppError(400, "Turnstile verification is required.", "turnstile_required");
    }

    const forwardedFor = request.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor?.split(",")[0]?.trim() ?? null;
    const result = await createSubmission({
      ipAddress,
      proposedCategory: body.proposedCategory ?? null,
      proposedName: body.proposedName ?? null,
      proposedSummary: body.proposedSummary ?? null,
      repositoryUrl: body.repositoryUrl ?? null,
      sourceUrl: body.sourceUrl ?? null,
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
        error: error instanceof Error ? error.message : "Unknown skill submission failure.",
      },
      { status: 500 },
    );
  }
}

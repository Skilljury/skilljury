import { NextRequest, NextResponse } from "next/server";

import { getCurrentViewer } from "@/lib/auth/session";
import { AppError } from "@/lib/errors/appError";
import { prefillFromUrl } from "@/lib/submissions/prefillFromUrl";

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

    const body = (await request.json()) as SubmissionPrefillBody;

    if (!body.repositoryUrl) {
      throw new AppError(400, "Repository URL is required.", "repository_required");
    }

    const prefill = await prefillFromUrl({
      repositoryUrl: body.repositoryUrl,
      sourceUrl: body.sourceUrl ?? null,
    });

    return NextResponse.json({ prefill });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown prefill failure.",
      },
      { status: 500 },
    );
  }
}

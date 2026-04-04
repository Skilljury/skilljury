import { NextRequest, NextResponse } from "next/server";

import { getCurrentViewer } from "@/lib/auth/session";
import { AppError } from "@/lib/errors/appError";
import { routeErrorResponse } from "@/lib/errors/routeError";
import { createReview } from "@/lib/reviews/createReview";

type ReviewRequestBody = {
  agentSlug?: string | null;
  cons?: string;
  documentationRating?: number | null;
  experienceLevel?: string | null;
  overallRating?: number;
  outputQualityRating?: number | null;
  proofOfUseType?: string | null;
  proofOfUseUrl?: string | null;
  pros?: string;
  reliabilityRating?: number | null;
  reviewBody?: string | null;
  reviewTitle?: string | null;
  setupRating?: number | null;
  skillSlug?: string;
  turnstileToken?: string;
  useCase?: string | null;
  valueForEffortRating?: number | null;
  wouldRecommend?: "yes" | "no" | "with_caveats";
};

export async function POST(request: NextRequest) {
  try {
    const viewer = await getCurrentViewer();

    if (!viewer.user) {
      throw new AppError(401, "You must sign in before submitting a review.", "unauthorized");
    }

    if (!viewer.profile?.username) {
      throw new AppError(
        403,
        "Finish your SkillJury profile before submitting a review.",
        "profile_incomplete",
      );
    }

    let body: ReviewRequestBody;
    try {
      body = (await request.json()) as ReviewRequestBody;
    } catch {
      throw new AppError(400, "Invalid JSON in request body.", "invalid_json");
    }

    if (
      !body.skillSlug ||
      !body.turnstileToken ||
      !body.wouldRecommend ||
      typeof body.overallRating !== "number" ||
      !body.pros?.trim() ||
      !body.cons?.trim()
    ) {
      throw new AppError(
        400,
        "Overall rating, recommendation, pros, cons, and the Turnstile check are required.",
        "invalid_review_payload",
      );
    }

    const forwardedFor = request.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor?.split(",")[0]?.trim() ?? null;
    const result = await createReview({
      agentSlug: body.agentSlug ?? null,
      cons: body.cons,
      documentationRating: body.documentationRating ?? null,
      experienceLevel: body.experienceLevel ?? null,
      ipAddress,
      overallRating: body.overallRating,
      outputQualityRating: body.outputQualityRating ?? null,
      proofOfUseType: body.proofOfUseType ?? null,
      proofOfUseUrl: body.proofOfUseUrl ?? null,
      pros: body.pros,
      reliabilityRating: body.reliabilityRating ?? null,
      reviewBody: body.reviewBody ?? null,
      reviewTitle: body.reviewTitle ?? null,
      setupRating: body.setupRating ?? null,
      skillSlug: body.skillSlug,
      turnstileToken: body.turnstileToken,
      useCase: body.useCase ?? null,
      userId: viewer.user.id,
      userRole: viewer.profile?.role ?? "user",
      userStatus: viewer.profile?.accountStatus ?? "active",
      valueForEffortRating: body.valueForEffortRating ?? null,
      wouldRecommend: body.wouldRecommend,
    });

    return NextResponse.json(result);
  } catch (error) {
    return routeErrorResponse(error, {
      context: "create-review",
      fallbackMessage: "SkillJury could not submit this review right now.",
    });
  }
}

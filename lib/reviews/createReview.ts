import "server-only";

import { trackServerEvent } from "@/lib/analytics/events";
import { AppError } from "@/lib/errors/appError";
import { createModerationQueueItem } from "@/lib/moderation/queue";
import {
  enforceReviewRateLimits,
  getInitialReviewModerationStatus,
} from "@/lib/moderation/rateLimits";
import { recomputeSkillReviewStats } from "@/lib/reviews/aggregateRatings";
import { getTurnstileSecretKey } from "@/lib/supabase/config";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

type ReviewPayload = {
  agentSlug?: string | null;
  cons: string;
  documentationRating?: number | null;
  experienceLevel?: string | null;
  ipAddress?: string | null;
  overallRating: number;
  outputQualityRating?: number | null;
  proofOfUseType?: string | null;
  proofOfUseUrl?: string | null;
  pros: string;
  reliabilityRating?: number | null;
  reviewBody?: string | null;
  reviewTitle?: string | null;
  setupRating?: number | null;
  skillSlug: string;
  turnstileToken: string;
  useCase?: string | null;
  userId: string;
  userRole: "admin" | "moderator" | "user";
  userStatus: "active" | "limited" | "suspended" | "banned";
  valueForEffortRating?: number | null;
  wouldRecommend: "yes" | "no" | "with_caveats";
};

function sanitizeText(value: string | null | undefined) {
  return value?.trim() ?? "";
}

function normalizeOptionalRating(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }

  return Math.max(1, Math.min(5, Math.round(value)));
}

async function verifyTurnstileToken(token: string, remoteIp?: string | null) {
  const secret = getTurnstileSecretKey();

  if (!secret) {
    throw new AppError(
      500,
      "Turnstile is not configured for review submission yet.",
      "turnstile_not_configured",
    );
  }

  const body = new URLSearchParams({
    response: token,
    secret,
  });

  if (remoteIp) {
    body.set("remoteip", remoteIp);
  }

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
      cache: "no-store",
    },
  );
  const payload = (await response.json()) as {
    success?: boolean;
  };

  if (!payload.success) {
    throw new AppError(
      400,
      "Turnstile verification failed. Please retry the form submission.",
      "turnstile_failed",
    );
  }
}

export async function createReview(payload: ReviewPayload) {
  if (payload.userStatus === "suspended" || payload.userStatus === "banned") {
    throw new AppError(
      403,
      "This account cannot submit reviews right now.",
      "account_blocked",
    );
  }

  await verifyTurnstileToken(payload.turnstileToken, payload.ipAddress);

  const supabase = createServiceRoleSupabaseClient();
  const { data: skill, error: skillError } = await supabase
    .from("skills")
    .select("id, slug")
    .eq("slug", payload.skillSlug)
    .eq("status", "active")
    .maybeSingle();

  if (skillError) {
    throw skillError;
  }

  if (!skill) {
    throw new AppError(404, "Skill not found.", "skill_not_found");
  }

  await enforceReviewRateLimits({
    skillId: skill.id as number,
    userId: payload.userId,
  });

  let agentId: number | null = null;

  if (payload.agentSlug) {
    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("id")
      .eq("slug", payload.agentSlug)
      .maybeSingle();

    if (agentError) {
      throw agentError;
    }

    agentId = (agent?.id as number | undefined) ?? null;
  }

  const moderationStatus = await getInitialReviewModerationStatus({
    role: payload.userRole,
    userId: payload.userId,
  });
  const { data: insertedReview, error: insertError } = await supabase
    .from("reviews")
    .insert({
      agent_id: agentId,
      cons: sanitizeText(payload.cons),
      documentation_rating: normalizeOptionalRating(payload.documentationRating),
      experience_level: payload.experienceLevel ?? null,
      moderation_status: moderationStatus,
      overall_rating: normalizeOptionalRating(payload.overallRating),
      output_quality_rating: normalizeOptionalRating(payload.outputQualityRating),
      proof_of_use_type: payload.proofOfUseType ?? null,
      proof_of_use_url: sanitizeText(payload.proofOfUseUrl) || null,
      pros: sanitizeText(payload.pros),
      published_at:
        moderationStatus === "approved" ? new Date().toISOString() : null,
      reliability_rating: normalizeOptionalRating(payload.reliabilityRating),
      review_body: sanitizeText(payload.reviewBody) || null,
      review_title: sanitizeText(payload.reviewTitle) || null,
      setup_rating: normalizeOptionalRating(payload.setupRating),
      skill_id: skill.id,
      use_case: sanitizeText(payload.useCase) || null,
      user_id: payload.userId,
      value_for_effort_rating: normalizeOptionalRating(payload.valueForEffortRating),
      would_recommend: payload.wouldRecommend,
    })
    .select("id, moderation_status")
    .single();

  if (insertError) {
    throw insertError;
  }

  if (moderationStatus === "pending") {
    await createModerationQueueItem({
      itemId: String(insertedReview.id),
      itemType: "review",
      priority: 1,
      queueReason: "First reviews from a new account require manual moderation.",
      suggestedAction: "review_quality_check",
    });
  } else {
    await recomputeSkillReviewStats(skill.id as number);
  }

  trackServerEvent("review_submitted", {
    moderationStatus: insertedReview.moderation_status,
    reviewId: insertedReview.id,
    skillId: skill.id,
    userId: payload.userId,
  });

  return {
    moderationStatus: insertedReview.moderation_status as string,
    reviewId: insertedReview.id as number,
    skillSlug: skill.slug as string,
  };
}

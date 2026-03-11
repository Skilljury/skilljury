import "server-only";

import { AppError } from "@/lib/errors/appError";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export async function enforceReviewRateLimits({
  skillId,
  userId,
}: {
  skillId: number;
  userId: string;
}) {
  const supabase = createServiceRoleSupabaseClient();
  const { count: existingReviewCount, error: existingReviewError } = await supabase
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("skill_id", skillId)
    .eq("user_id", userId);

  if (existingReviewError) {
    throw existingReviewError;
  }

  if ((existingReviewCount ?? 0) > 0) {
    throw new AppError(
      409,
      "You have already submitted a review for this skill.",
      "duplicate_review",
    );
  }

  const startOfUtcDay = new Date();
  startOfUtcDay.setUTCHours(0, 0, 0, 0);

  const { count: dailyReviewCount, error: dailyReviewError } = await supabase
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfUtcDay.toISOString());

  if (dailyReviewError) {
    throw dailyReviewError;
  }

  if ((dailyReviewCount ?? 0) >= 3) {
    throw new AppError(
      429,
      "You have reached the daily review limit. Please try again tomorrow.",
      "daily_review_limit",
    );
  }
}

export async function getInitialReviewModerationStatus({
  role,
  userId,
}: {
  role: "admin" | "moderator" | "user";
  userId: string;
}) {
  if (role === "admin" || role === "moderator") {
    return "approved" as const;
  }

  const supabase = createServiceRoleSupabaseClient();
  const { count, error } = await supabase
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return (count ?? 0) < 2 ? ("pending" as const) : ("approved" as const);
}

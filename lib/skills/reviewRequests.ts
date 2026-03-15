import "server-only";

import { AppError } from "@/lib/errors/appError";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

const REVIEW_REQUESTS_PER_DAY_LIMIT = 10;

export type ReviewRequestSummary = {
  totalCount: number;
  viewerHasRequested: boolean;
};

export async function getReviewRequestSummary(
  skillId: number,
  viewerUserId?: string | null,
): Promise<ReviewRequestSummary> {
  const supabase = createServiceRoleSupabaseClient();
  const [{ count, error: countError }, viewerRequest] = await Promise.all([
    supabase
      .from("review_requests")
      .select("id", { count: "exact", head: true })
      .eq("skill_id", skillId),
    viewerUserId
      ? supabase
          .from("review_requests")
          .select("id")
          .eq("skill_id", skillId)
          .eq("user_id", viewerUserId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (countError) {
    throw countError;
  }

  if (viewerRequest.error) {
    throw viewerRequest.error;
  }

  return {
    totalCount: count ?? 0,
    viewerHasRequested: Boolean(viewerRequest.data),
  };
}

export async function createReviewRequest({
  skillSlug,
  userId,
}: {
  skillSlug: string;
  userId: string;
}) {
  const supabase = createServiceRoleSupabaseClient();
  const dayStart = new Date();
  dayStart.setUTCHours(0, 0, 0, 0);
  const { count: dailyCount, error: dailyCountError } = await supabase
    .from("review_requests")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", dayStart.toISOString());

  if (dailyCountError) {
    throw dailyCountError;
  }

  if ((dailyCount ?? 0) >= REVIEW_REQUESTS_PER_DAY_LIMIT) {
    throw new AppError(
      429,
      "Daily review request limit reached. Please try again tomorrow.",
      "review_request_rate_limited",
    );
  }

  const { data: skill, error: skillError } = await supabase
    .from("skills")
    .select("id, slug")
    .eq("slug", skillSlug)
    .eq("status", "active")
    .maybeSingle();

  if (skillError) {
    throw skillError;
  }

  if (!skill) {
    throw new AppError(404, "Skill not found.", "skill_not_found");
  }

  const { error } = await supabase.from("review_requests").upsert(
    {
      skill_id: skill.id,
      user_id: userId,
    },
    {
      onConflict: "skill_id,user_id",
      ignoreDuplicates: true,
    },
  );

  if (error) {
    throw error;
  }

  const summary = await getReviewRequestSummary(skill.id as number, userId);

  return {
    skillId: skill.id as number,
    skillSlug: skill.slug as string,
    totalCount: summary.totalCount,
    viewerHasRequested: summary.viewerHasRequested,
  };
}

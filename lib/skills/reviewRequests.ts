import "server-only";

import { AppError } from "@/lib/errors/appError";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

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

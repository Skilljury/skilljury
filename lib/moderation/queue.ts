import "server-only";

import { isMissingRelationError, logDataAccessError } from "@/lib/db/errors";
import { AppError } from "@/lib/errors/appError";
import { writeAuditLog } from "@/lib/moderation/auditLog";
import { recomputeSkillReviewStats } from "@/lib/reviews/aggregateRatings";
import { getSiteUrl } from "@/lib/supabase/config";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { sanitizeExternalUrl } from "@/lib/utils/externalUrl";
import { slugify } from "@/lib/utils/slugify";

export type ModerationAction = "approve" | "reject" | "escalate";

export type ModerationQueueItem = {
  createdAt: string;
  decisionNotes: string | null;
  id: number;
  itemId: string;
  itemType: string;
  priority: number;
  queueReason: string;
  report:
    | {
        id: number;
        notes: string | null;
        reason: string;
        status: string;
        targetId: string;
        targetType: string;
      }
    | null;
  review:
    | {
        body: string | null;
        createdAt: string;
        id: number;
        overallRating: number;
        pros: string;
        skillName: string | null;
        skillSlug: string | null;
        title: string | null;
        userName: string;
        wouldRecommend: string;
      }
    | null;
  status: string;
  submission:
    | {
        id: number;
        name: string | null;
        repositoryUrl: string;
        sourceUrl: string | null;
        summary: string | null;
      }
    | null;
  suggestedAction: string | null;
};

type ActionMutationResult = {
  afterSummary: Record<string, unknown>;
  beforeSummary: Record<string, unknown>;
  skillIdToRefresh?: number | null;
  targetId: string;
  targetType: string;
};

function resolveQueueStatus(action: ModerationAction) {
  return action === "approve"
    ? "approved"
    : action === "reject"
      ? "rejected"
      : "escalated";
}

function normalizeJsonArray(
  value: unknown,
): Array<{
  id?: number;
  name?: string;
  slug?: string;
}> {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is { id?: number; name?: string; slug?: string } => {
    return typeof entry === "object" && entry !== null;
  });
}

function deriveSubmissionName(submission: {
  prefilled_name: string | null;
  proposed_name: string | null;
  repository_url: string;
}) {
  if (submission.proposed_name?.trim()) {
    return submission.proposed_name.trim();
  }

  if (submission.prefilled_name?.trim()) {
    return submission.prefilled_name.trim();
  }

  try {
    const parsed = new URL(submission.repository_url);
    return parsed.pathname.split("/").filter(Boolean).at(-1) ?? "Submitted skill";
  } catch {
    return "Submitted skill";
  }
}

function deriveSubmissionSummary(submission: {
  prefilled_summary: string | null;
  proposed_summary: string | null;
}) {
  return submission.proposed_summary?.trim() || submission.prefilled_summary?.trim() || null;
}

function deriveCanonicalSourceUrl(submission: {
  prefilled_source_url: string | null;
  repository_url: string;
  source_url: string | null;
}) {
  return (
    sanitizeExternalUrl(submission.source_url) ||
    sanitizeExternalUrl(submission.prefilled_source_url) ||
    sanitizeExternalUrl(submission.repository_url)
  );
}

async function findExistingSkillForSubmission(
  canonicalSourceUrl: string,
  repositoryUrl: string,
) {
  const supabase = createServiceRoleSupabaseClient();
  const { data: sourceMatch, error: sourceError } = await supabase
    .from("skills")
    .select("id, slug")
    .eq("canonical_source_url", canonicalSourceUrl)
    .limit(1)
    .maybeSingle();

  if (sourceError) {
    throw sourceError;
  }

  if (sourceMatch) {
    return sourceMatch;
  }

  const { data: repositoryMatch, error: repositoryError } = await supabase
    .from("skills")
    .select("id, slug")
    .eq("repository_url", repositoryUrl)
    .limit(1)
    .maybeSingle();

  if (repositoryError) {
    throw repositoryError;
  }

  return repositoryMatch;
}

async function findMatchedCategory(categoryValue: string) {
  const supabase = createServiceRoleSupabaseClient();
  const slugCandidate = slugify(categoryValue);

  if (slugCandidate) {
    const { data: slugMatch, error: slugError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", slugCandidate)
      .limit(1)
      .maybeSingle();

    if (slugError) {
      throw slugError;
    }

    if (slugMatch) {
      return slugMatch;
    }
  }

  const { data: nameMatch, error: nameError } = await supabase
    .from("categories")
    .select("id")
    .ilike("name", categoryValue)
    .limit(1)
    .maybeSingle();

  if (nameError) {
    throw nameError;
  }

  return nameMatch;
}

async function createModerationAwareSkillFromSubmission(
  submissionId: number,
  decisionNotes: string | null,
  actorUserId: string,
) {
  const supabase = createServiceRoleSupabaseClient();
  const { data: submission, error: submissionError } = await supabase
    .from("skill_submissions")
    .select(
      "id, status, source_url, repository_url, proposed_name, proposed_summary, proposed_category, proposed_agent_support, prefilled_name, prefilled_summary, prefilled_agent_support, prefilled_source_url, created_skill_id",
    )
    .eq("id", submissionId)
    .maybeSingle();

  if (submissionError) {
    throw submissionError;
  }

  if (!submission) {
    throw new AppError(404, "Skill submission not found.", "submission_not_found");
  }

  const canonicalSourceUrl = deriveCanonicalSourceUrl(submission);

  if (!canonicalSourceUrl) {
    throw new AppError(
      400,
      "Submission is missing a valid public source URL.",
      "submission_invalid_source_url",
    );
  }

  const existingSkill = await findExistingSkillForSubmission(
    canonicalSourceUrl,
    submission.repository_url,
  );

  let createdSkillId = existingSkill?.id as number | undefined;

  if (!createdSkillId) {
    const manualSourceSlug = "user-submissions";
    const { data: existingSource, error: sourceReadError } = await supabase
      .from("sources")
      .select("id")
      .eq("slug", manualSourceSlug)
      .maybeSingle();

    if (sourceReadError) {
      throw sourceReadError;
    }

    let sourceId = existingSource?.id as number | undefined;

    if (!sourceId) {
      const { data: insertedSource, error: sourceInsertError } = await supabase
        .from("sources")
        .insert({
          attribution_text: "Submitted through the SkillJury public review workflow.",
          homepage_url: `${getSiteUrl()}/submit-skill`,
          name: "SkillJury user submissions",
          slug: manualSourceSlug,
          source_type: "manual",
        })
        .select("id")
        .single();

      if (sourceInsertError) {
        throw sourceInsertError;
      }

      sourceId = insertedSource.id as number;
    }

    const baseSlug = slugify(deriveSubmissionName(submission)) || `submitted-skill-${submissionId}`;
    let candidateSlug = baseSlug;
    let suffix = 2;

    while (true) {
      const { data: slugMatch, error: slugError } = await supabase
        .from("skills")
        .select("id")
        .eq("slug", candidateSlug)
        .maybeSingle();

      if (slugError) {
        throw slugError;
      }

      if (!slugMatch) {
        break;
      }

      candidateSlug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    const skillName = deriveSubmissionName(submission);
    const skillSummary = deriveSubmissionSummary(submission);
    const { data: insertedSkill, error: skillInsertError } = await supabase
      .from("skills")
      .insert({
        canonical_source_url: canonicalSourceUrl,
        faq_content: [],
        first_seen_at: new Date().toISOString().slice(0, 10),
        last_synced_at: new Date().toISOString(),
        long_description: skillSummary,
        name: skillName,
        repository_url: submission.repository_url,
        short_summary: skillSummary,
        slug: candidateSlug,
        source_id: sourceId,
        source_skill_id: `submission-${submission.id}`,
        status: "active",
      })
      .select("id, slug")
      .single();

    if (skillInsertError) {
      throw skillInsertError;
    }

    createdSkillId = insertedSkill.id as number;

    const categoryValue = submission.proposed_category?.trim();

    if (categoryValue) {
      const matchedCategory = await findMatchedCategory(categoryValue);

      if (matchedCategory?.id) {
        const { error: categoryInsertError } = await supabase
          .from("skill_categories")
          .upsert(
            {
              category_id: matchedCategory.id,
              skill_id: createdSkillId,
            },
            {
              onConflict: "skill_id,category_id",
              ignoreDuplicates: true,
            },
          );

        if (categoryInsertError) {
          throw categoryInsertError;
        }
      }
    }

    const inferredAgents = normalizeJsonArray(
      submission.proposed_agent_support ?? submission.prefilled_agent_support,
    );

    if (inferredAgents.length > 0) {
      const agentSlugs = inferredAgents
        .map((agent) => agent.slug?.trim())
        .filter((value): value is string => Boolean(value));

      if (agentSlugs.length > 0) {
        const { data: matchedAgents, error: agentError } = await supabase
          .from("agents")
          .select("id, slug")
          .in("slug", agentSlugs);

        if (agentError) {
          throw agentError;
        }

        if ((matchedAgents ?? []).length > 0) {
          const { error: compatibilityError } = await supabase
            .from("skill_agent_compatibility")
            .upsert(
              (matchedAgents ?? []).map((agent) => ({
                agent_id: agent.id,
                skill_id: createdSkillId,
                support_type: "community confirmed",
              })),
              {
                onConflict: "skill_id,agent_id",
                ignoreDuplicates: true,
              },
            );

          if (compatibilityError) {
            throw compatibilityError;
          }
        }
      }
    }
  }

  const nextStatus = resolveQueueStatus("approve");
  const { error: submissionUpdateError } = await supabase
    .from("skill_submissions")
    .update({
      created_skill_id: createdSkillId,
      moderation_notes: decisionNotes,
      resolved_at: new Date().toISOString(),
      reviewed_by_user_id: actorUserId,
      status: nextStatus,
    })
    .eq("id", submissionId);

  if (submissionUpdateError) {
    throw submissionUpdateError;
  }

  return {
    afterSummary: {
      createdSkillId,
      status: nextStatus,
    },
    beforeSummary: {
      createdSkillId: submission.created_skill_id,
      status: submission.status,
    },
    targetId: String(submissionId),
    targetType: "submission",
  } satisfies ActionMutationResult;
}

async function resolveSubmissionAction({
  action,
  actorUserId,
  decisionNotes,
  submissionId,
}: {
  action: ModerationAction;
  actorUserId: string;
  decisionNotes: string | null;
  submissionId: number;
}) {
  if (action === "approve") {
    return createModerationAwareSkillFromSubmission(submissionId, decisionNotes, actorUserId);
  }

  const supabase = createServiceRoleSupabaseClient();
  const { data: submission, error: submissionError } = await supabase
    .from("skill_submissions")
    .select("id, status, created_skill_id")
    .eq("id", submissionId)
    .maybeSingle();

  if (submissionError) {
    throw submissionError;
  }

  if (!submission) {
    throw new AppError(404, "Skill submission not found.", "submission_not_found");
  }

  const nextStatus = resolveQueueStatus(action);
  const { error: updateError } = await supabase
    .from("skill_submissions")
    .update({
      moderation_notes: decisionNotes,
      resolved_at: new Date().toISOString(),
      reviewed_by_user_id: actorUserId,
      status: nextStatus,
    })
    .eq("id", submissionId);

  if (updateError) {
    throw updateError;
  }

  return {
    afterSummary: {
      createdSkillId: submission.created_skill_id,
      status: nextStatus,
    },
    beforeSummary: {
      createdSkillId: submission.created_skill_id,
      status: submission.status,
    },
    targetId: String(submissionId),
    targetType: "submission",
  } satisfies ActionMutationResult;
}

async function resolveReportAction({
  action,
  actorUserId,
  reportId,
}: {
  action: ModerationAction;
  actorUserId: string;
  reportId: number;
}) {
  const supabase = createServiceRoleSupabaseClient();
  const { data: report, error: reportError } = await supabase
    .from("reports")
    .select("id, status, reason, target_id, target_type")
    .eq("id", reportId)
    .maybeSingle();

  if (reportError) {
    throw reportError;
  }

  if (!report) {
    throw new AppError(404, "Report not found.", "report_not_found");
  }

  const nextStatus = resolveQueueStatus(action);
  const { error: updateError } = await supabase
    .from("reports")
    .update({
      resolved_at: new Date().toISOString(),
      reviewed_by_user_id: actorUserId,
      status: nextStatus,
    })
    .eq("id", reportId);

  if (updateError) {
    throw updateError;
  }

  return {
    afterSummary: {
      reason: report.reason,
      status: nextStatus,
      targetId: report.target_id,
      targetType: report.target_type,
    },
    beforeSummary: {
      reason: report.reason,
      status: report.status,
      targetId: report.target_id,
      targetType: report.target_type,
    },
    targetId: String(reportId),
    targetType: "report",
  } satisfies ActionMutationResult;
}

async function resolveReviewAction({
  action,
  decisionNotes,
  reviewId,
}: {
  action: ModerationAction;
  decisionNotes: string | null;
  reviewId: number;
}) {
  const supabase = createServiceRoleSupabaseClient();
  const { data: reviewBefore, error: reviewReadError } = await supabase
    .from("reviews")
    .select("id, skill_id, moderation_status, published_at")
    .eq("id", reviewId)
    .maybeSingle();

  if (reviewReadError) {
    throw reviewReadError;
  }

  if (!reviewBefore) {
    throw new AppError(404, "Review not found.", "review_not_found");
  }

  const nextReviewStatus = resolveQueueStatus(action);
  const nextPublishedAt =
    action === "approve"
      ? reviewBefore.published_at ?? new Date().toISOString()
      : null;
  const { error: reviewUpdateError } = await supabase
    .from("reviews")
    .update({
      moderation_notes: decisionNotes ?? null,
      moderation_status: nextReviewStatus,
      published_at: nextPublishedAt,
    })
    .eq("id", reviewId);

  if (reviewUpdateError) {
    throw reviewUpdateError;
  }

  return {
    afterSummary: {
      moderationStatus: nextReviewStatus,
      publishedAt: nextPublishedAt,
    },
    beforeSummary: {
      moderationStatus: reviewBefore.moderation_status,
      publishedAt: reviewBefore.published_at,
    },
    skillIdToRefresh: reviewBefore.skill_id as number,
    targetId: String(reviewId),
    targetType: "review",
  } satisfies ActionMutationResult;
}

export async function createModerationQueueItem({
  itemId,
  itemType,
  priority = 0,
  queueReason,
  suggestedAction,
}: {
  itemId: string;
  itemType: string;
  priority?: number;
  queueReason: string;
  suggestedAction?: string | null;
}) {
  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase.from("moderation_queue").insert({
    item_id: itemId,
    item_type: itemType,
    priority,
    queue_reason: queueReason,
    suggested_action: suggestedAction ?? null,
  });

  if (error) {
    throw error;
  }
}

export async function getModerationQueueItems(
  limit = 50,
): Promise<ModerationQueueItem[]> {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("moderation_queue")
    .select(
      "id, item_type, item_id, priority, queue_reason, suggested_action, status, decision_notes, created_at",
    )
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    logDataAccessError("moderation-queue", error);

    if (isMissingRelationError(error.message)) {
      return [];
    }

    throw error;
  }

  const rows = data ?? [];
  const reviewIds = rows
    .filter((row) => row.item_type === "review")
    .map((row) => Number(row.item_id))
    .filter((value) => Number.isFinite(value));
  const submissionIds = rows
    .filter((row) => row.item_type === "submission")
    .map((row) => Number(row.item_id))
    .filter((value) => Number.isFinite(value));
  const reportIds = rows
    .filter((row) => row.item_type === "report")
    .map((row) => Number(row.item_id))
    .filter((value) => Number.isFinite(value));
  const reviewMap = new Map<number, ModerationQueueItem["review"]>();
  const submissionMap = new Map<number, ModerationQueueItem["submission"]>();
  const reportMap = new Map<number, ModerationQueueItem["report"]>();

  if (reviewIds.length > 0) {
    const { data: reviews, error: reviewsError } = await supabase
      .from("reviews")
      .select(
        "id, review_title, review_body, overall_rating, pros, would_recommend, created_at, skills(name, slug), user_profiles(display_name, username)",
      )
      .in("id", reviewIds);

    if (reviewsError) {
      throw reviewsError;
    }

    (reviews ?? []).forEach((review) => {
      const skill = Array.isArray(review.skills) ? review.skills[0] : review.skills;
      const profile = Array.isArray(review.user_profiles)
        ? review.user_profiles[0]
        : review.user_profiles;

      reviewMap.set(review.id as number, {
        body: (review.review_body as string | null) ?? null,
        createdAt: review.created_at as string,
        id: review.id as number,
        overallRating: review.overall_rating as number,
        pros: review.pros as string,
        skillName: (skill?.name as string | null) ?? null,
        skillSlug: (skill?.slug as string | null) ?? null,
        title: (review.review_title as string | null) ?? null,
        userName:
          (profile?.display_name as string | null) ??
          (profile?.username as string | null) ??
          "Anonymous reviewer",
        wouldRecommend: review.would_recommend as string,
      });
    });
  }

  if (submissionIds.length > 0) {
    const { data: submissions, error: submissionsError } = await supabase
      .from("skill_submissions")
      .select(
        "id, repository_url, source_url, proposed_name, proposed_summary, prefilled_name, prefilled_summary",
      )
      .in("id", submissionIds);

    if (submissionsError) {
      throw submissionsError;
    }

    (submissions ?? []).forEach((submission) => {
      submissionMap.set(submission.id as number, {
        id: submission.id as number,
        name:
          (submission.proposed_name as string | null) ??
          (submission.prefilled_name as string | null) ??
          null,
        repositoryUrl: submission.repository_url as string,
        sourceUrl: (submission.source_url as string | null) ?? null,
        summary:
          (submission.proposed_summary as string | null) ??
          (submission.prefilled_summary as string | null) ??
          null,
      });
    });
  }

  if (reportIds.length > 0) {
    const { data: reports, error: reportsError } = await supabase
      .from("reports")
      .select("id, target_type, target_id, reason, notes, status")
      .in("id", reportIds);

    if (reportsError) {
      throw reportsError;
    }

    (reports ?? []).forEach((report) => {
      reportMap.set(report.id as number, {
        id: report.id as number,
        notes: (report.notes as string | null) ?? null,
        reason: report.reason as string,
        status: report.status as string,
        targetId: report.target_id as string,
        targetType: report.target_type as string,
      });
    });
  }

  return rows.map((row) => ({
    createdAt: row.created_at as string,
    decisionNotes: (row.decision_notes as string | null) ?? null,
    id: row.id as number,
    itemId: row.item_id as string,
    itemType: row.item_type as string,
    priority: row.priority as number,
    queueReason: row.queue_reason as string,
    report: row.item_type === "report" ? reportMap.get(Number(row.item_id)) ?? null : null,
    review: row.item_type === "review" ? reviewMap.get(Number(row.item_id)) ?? null : null,
    status: row.status as string,
    submission:
      row.item_type === "submission" ? submissionMap.get(Number(row.item_id)) ?? null : null,
    suggestedAction: (row.suggested_action as string | null) ?? null,
  }));
}

export async function applyModerationAction({
  action,
  actorUserId,
  decisionNotes,
  queueItemId,
}: {
  action: ModerationAction;
  actorUserId: string;
  decisionNotes?: string | null;
  queueItemId: number;
}) {
  const supabase = createServiceRoleSupabaseClient();
  const { data: queueItem, error: queueReadError } = await supabase
    .from("moderation_queue")
    .select("id, item_type, item_id, status")
    .eq("id", queueItemId)
    .maybeSingle();

  if (queueReadError) {
    throw queueReadError;
  }

  if (!queueItem) {
    throw new AppError(404, "Moderation queue item not found.", "queue_not_found");
  }

  const normalizedNotes = decisionNotes?.trim() || null;
  let mutation: ActionMutationResult;

  if (queueItem.item_type === "review") {
    mutation = await resolveReviewAction({
      action,
      decisionNotes: normalizedNotes,
      reviewId: Number(queueItem.item_id),
    });
  } else if (queueItem.item_type === "submission") {
    mutation = await resolveSubmissionAction({
      action,
      actorUserId,
      decisionNotes: normalizedNotes,
      submissionId: Number(queueItem.item_id),
    });
  } else if (queueItem.item_type === "report") {
    mutation = await resolveReportAction({
      action,
      actorUserId,
      reportId: Number(queueItem.item_id),
    });
  } else {
    throw new AppError(
      400,
      "This moderation endpoint does not support that queue item yet.",
      "unsupported_queue_item",
    );
  }

  const nextQueueStatus = resolveQueueStatus(action);
  const { error: queueUpdateError } = await supabase
    .from("moderation_queue")
    .update({
      assigned_moderator_id: actorUserId,
      decision_notes: normalizedNotes,
      resolved_at: new Date().toISOString(),
      status: nextQueueStatus,
    })
    .eq("id", queueItemId);

  if (queueUpdateError) {
    throw queueUpdateError;
  }

  await writeAuditLog({
    actionType: `${queueItem.item_type}_${action}`,
    actorUserId,
    afterSummary: {
      ...mutation.afterSummary,
      queueStatus: nextQueueStatus,
    },
    beforeSummary: {
      ...mutation.beforeSummary,
      queueStatus: queueItem.status,
    },
    targetId: mutation.targetId,
    targetType: mutation.targetType,
  });

  if (mutation.skillIdToRefresh) {
    await recomputeSkillReviewStats(mutation.skillIdToRefresh);
  }
}

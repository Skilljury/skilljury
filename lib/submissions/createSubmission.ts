import "server-only";

import { trackServerEvent } from "@/lib/analytics/events";
import { AppError } from "@/lib/errors/appError";
import { createModerationQueueItem } from "@/lib/moderation/queue";
import { prefillFromUrl } from "@/lib/submissions/prefillFromUrl";
import { getTurnstileSecretKey } from "@/lib/supabase/config";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

type SubmissionPayload = {
  proposedCategory?: string | null;
  proposedName?: string | null;
  proposedSummary?: string | null;
  repositoryUrl?: string | null;
  sourceUrl?: string | null;
  turnstileToken: string;
  userId: string;
  userStatus: "active" | "limited" | "suspended" | "banned";
};

async function verifyTurnstileToken(token: string, remoteIp?: string | null) {
  const secret = getTurnstileSecretKey();

  if (!secret) {
    throw new AppError(
      500,
      "Turnstile is not configured for skill submissions yet.",
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
      "Turnstile verification failed. Please retry the submission.",
      "turnstile_failed",
    );
  }
}

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function createSubmission(
  payload: SubmissionPayload & { ipAddress?: string | null },
) {
  if (payload.userStatus === "suspended" || payload.userStatus === "banned") {
    throw new AppError(
      403,
      "This account cannot submit skills right now.",
      "account_blocked",
    );
  }

  await verifyTurnstileToken(payload.turnstileToken, payload.ipAddress);

  const repositoryUrl = normalizeText(payload.repositoryUrl);

  if (!repositoryUrl) {
    throw new AppError(400, "Repository URL is required.", "repository_required");
  }

  const prefill = await prefillFromUrl({
    repositoryUrl,
    sourceUrl: payload.sourceUrl ?? null,
  });
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("skill_submissions")
    .insert({
      prefilled_agent_support: prefill.inferredAgents,
      prefilled_name: prefill.inferredName,
      prefilled_source_url: prefill.inferredSourceUrl,
      prefilled_summary: prefill.inferredSummary,
      proposed_agent_support: prefill.inferredAgents,
      proposed_category: normalizeText(payload.proposedCategory),
      proposed_name: normalizeText(payload.proposedName),
      proposed_summary: normalizeText(payload.proposedSummary),
      repository_url: prefill.repositoryUrl ?? repositoryUrl,
      source_url: prefill.inferredSourceUrl ?? normalizeText(payload.sourceUrl),
      submitted_by_user_id: payload.userId,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  await createModerationQueueItem({
    itemId: String(data.id),
    itemType: "submission",
    priority: 1,
    queueReason: "A new skill submission is waiting for moderator review.",
    suggestedAction: "validate_submission_metadata",
  });

  trackServerEvent("skill_submission_created", {
    repositoryUrl: prefill.repositoryUrl ?? repositoryUrl,
    submissionId: data.id,
    userId: payload.userId,
  });

  return {
    prefill,
    submissionId: data.id as number,
  };
}

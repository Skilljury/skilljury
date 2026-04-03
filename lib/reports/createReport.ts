import "server-only";

import { trackServerEvent } from "@/lib/analytics/events";
import { AppError } from "@/lib/errors/appError";
import { createModerationQueueItem } from "@/lib/moderation/queue";
import { getTurnstileSecretKey } from "@/lib/supabase/config";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export const REPORT_REASONS = [
  "abuse_harassment",
  "copyright_issue",
  "fake_review",
  "off_topic",
  "other",
  "spam",
  "wrong_listing_data",
] as const;

export const REPORT_TARGET_TYPES = ["review", "skill"] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];
export type ReportTargetType = (typeof REPORT_TARGET_TYPES)[number];

type ReportPayload = {
  notes?: string | null;
  reason: ReportReason;
  targetId: string;
  targetType: ReportTargetType;
  turnstileToken: string;
  userId: string;
  userStatus: "active" | "limited" | "suspended" | "banned";
};

async function verifyTurnstileToken(token: string, remoteIp?: string | null) {
  const secret = getTurnstileSecretKey();

  if (!secret) {
    throw new AppError(
      500,
      "Turnstile is not configured for reports yet.",
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
      "Turnstile verification failed. Please retry the report.",
      "turnstile_failed",
    );
  }
}

export async function createReport(
  payload: ReportPayload & { ipAddress?: string | null },
) {
  if (payload.userStatus === "suspended" || payload.userStatus === "banned") {
    throw new AppError(
      403,
      "This account cannot submit reports right now.",
      "account_blocked",
    );
  }

  await verifyTurnstileToken(payload.turnstileToken, payload.ipAddress);

  if (!REPORT_REASONS.includes(payload.reason)) {
    throw new AppError(400, "Select a valid report reason.", "invalid_reason");
  }

  if (!REPORT_TARGET_TYPES.includes(payload.targetType)) {
    throw new AppError(400, "Select a valid report target.", "invalid_target_type");
  }

  const supabase = createServiceRoleSupabaseClient();

  if (payload.targetType === "review") {
    const { data, error } = await supabase
      .from("reviews")
      .select("id")
      .eq("id", Number(payload.targetId))
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new AppError(404, "Review not found.", "review_not_found");
    }
  } else {
    const { data, error } = await supabase
      .from("skills")
      .select("id")
      .eq("id", Number(payload.targetId))
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new AppError(404, "Skill not found.", "skill_not_found");
    }
  }

  const { data, error } = await supabase
    .from("reports")
    .insert({
      notes: payload.notes?.trim() || null,
      reason: payload.reason,
      reporter_user_id: payload.userId,
      target_id: payload.targetId,
      target_type: payload.targetType,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  await createModerationQueueItem({
    itemId: String(data.id),
    itemType: "report",
    priority: 2,
    queueReason: "A user report is waiting for moderation review.",
    suggestedAction: "triage_report",
  });

  trackServerEvent("report_submitted", {
    reportId: data.id,
    targetId: payload.targetId,
    targetType: payload.targetType,
    userId: payload.userId,
  });

  return {
    reportId: data.id as number,
  };
}

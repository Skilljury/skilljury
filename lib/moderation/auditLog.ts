import "server-only";

import { isMissingRelationError, logDataAccessError } from "@/lib/db/errors";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export type AuditLogEntry = {
  actionType: string;
  actorUserId: string | null;
  afterSummary: Record<string, unknown> | null;
  beforeSummary: Record<string, unknown> | null;
  createdAt: string;
  id: number;
  targetId: string;
  targetType: string;
};

export async function writeAuditLog({
  actionType,
  actorUserId,
  afterSummary,
  beforeSummary,
  targetId,
  targetType,
}: {
  actionType: string;
  actorUserId: string | null;
  afterSummary?: Record<string, unknown> | null;
  beforeSummary?: Record<string, unknown> | null;
  targetId: string;
  targetType: string;
}) {
  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase.from("audit_log").insert({
    action_type: actionType,
    actor_user_id: actorUserId,
    after_summary: afterSummary ?? null,
    before_summary: beforeSummary ?? null,
    target_id: targetId,
    target_type: targetType,
  });

  if (error) {
    throw error;
  }
}

export async function getRecentAuditLog(limit = 20): Promise<AuditLogEntry[]> {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("audit_log")
    .select(
      "id, action_type, actor_user_id, before_summary, after_summary, created_at, target_id, target_type",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    logDataAccessError("audit-log", error);

    if (isMissingRelationError(error.message)) {
      return [];
    }

    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id as number,
    actionType: row.action_type as string,
    actorUserId: (row.actor_user_id as string | null) ?? null,
    afterSummary: (row.after_summary as Record<string, unknown> | null) ?? null,
    beforeSummary: (row.before_summary as Record<string, unknown> | null) ?? null,
    createdAt: row.created_at as string,
    targetId: row.target_id as string,
    targetType: row.target_type as string,
  }));
}

export async function setAccountStatus({
  actorUserId,
  nextStatus,
  targetUserId,
}: {
  actorUserId: string | null;
  nextStatus: "active" | "limited" | "suspended" | "banned";
  targetUserId: string;
}) {
  const supabase = createServiceRoleSupabaseClient();
  const { data: existingProfile, error: readError } = await supabase
    .from("user_profiles")
    .select("account_status")
    .eq("id", targetUserId)
    .maybeSingle();

  if (readError) {
    throw readError;
  }

  const { error: updateError } = await supabase
    .from("user_profiles")
    .update({ account_status: nextStatus })
    .eq("id", targetUserId);

  if (updateError) {
    throw updateError;
  }

  await writeAuditLog({
    actionType: "account_status_changed",
    actorUserId,
    afterSummary: { accountStatus: nextStatus },
    beforeSummary: {
      accountStatus: existingProfile?.account_status ?? null,
    },
    targetId: targetUserId,
    targetType: "account",
  });
}

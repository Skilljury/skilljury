import "server-only";

import { AppError } from "@/lib/errors/appError";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

const PREFILL_REQUESTS_PER_HOUR_LIMIT = 12;
const PREFILL_REQUESTS_PER_DAY_LIMIT = 40;
const PREFILL_REQUESTS_PER_IP_PER_HOUR_LIMIT = 24;

function normalizeIpAddress(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function enforceSubmissionPrefillRateLimits({
  ipAddress,
  userId,
  userStatus,
}: {
  ipAddress?: string | null;
  userId: string;
  userStatus: "active" | "limited" | "suspended" | "banned";
}) {
  if (userStatus === "suspended" || userStatus === "banned") {
    throw new AppError(
      403,
      "This account cannot use repository prefill right now.",
      "account_blocked",
    );
  }

  const supabase = createServiceRoleSupabaseClient();
  const normalizedIpAddress = normalizeIpAddress(ipAddress);
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const startOfUtcDay = new Date();
  startOfUtcDay.setUTCHours(0, 0, 0, 0);

  const [hourlyWindow, dailyWindow, ipWindow] = await Promise.all([
    supabase
      .from("submission_prefill_requests")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", oneHourAgo),
    supabase
      .from("submission_prefill_requests")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", startOfUtcDay.toISOString()),
    normalizedIpAddress
      ? supabase
          .from("submission_prefill_requests")
          .select("id", { count: "exact", head: true })
          .eq("ip_address", normalizedIpAddress)
          .gte("created_at", oneHourAgo)
      : Promise.resolve({ count: null, error: null }),
  ]);

  if (hourlyWindow.error) {
    throw hourlyWindow.error;
  }

  if (dailyWindow.error) {
    throw dailyWindow.error;
  }

  if (ipWindow.error) {
    throw ipWindow.error;
  }

  if ((hourlyWindow.count ?? 0) >= PREFILL_REQUESTS_PER_HOUR_LIMIT) {
    throw new AppError(
      429,
      "Repository prefill is temporarily rate limited for this account. Please try again in a little while.",
      "submission_prefill_rate_limited",
    );
  }

  if ((dailyWindow.count ?? 0) >= PREFILL_REQUESTS_PER_DAY_LIMIT) {
    throw new AppError(
      429,
      "Daily repository prefill limit reached. Please try again tomorrow.",
      "submission_prefill_daily_limit",
    );
  }

  if (
    normalizedIpAddress &&
    (ipWindow.count ?? 0) >= PREFILL_REQUESTS_PER_IP_PER_HOUR_LIMIT
  ) {
    throw new AppError(
      429,
      "Repository prefill is temporarily rate limited from this network. Please try again later.",
      "submission_prefill_network_rate_limited",
    );
  }

  const { error } = await supabase.from("submission_prefill_requests").insert({
    ip_address: normalizedIpAddress,
    user_id: userId,
  });

  if (error) {
    throw error;
  }
}

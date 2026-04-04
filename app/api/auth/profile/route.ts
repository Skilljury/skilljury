import { NextRequest, NextResponse } from "next/server";

import { createAuthServerClient } from "@/lib/auth/session";
import { validateUsername } from "@/lib/auth/username";
import { AppError } from "@/lib/errors/appError";
import { routeErrorResponse } from "@/lib/errors/routeError";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

type ProfileBody = {
  displayName?: string | null;
  username?: string | null;
};

function normalizeDisplayName(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, 80) : null;
}

function isUniqueViolation(error: { code?: string; message?: string }) {
  return (
    error.code === "23505" ||
    error.message?.includes("duplicate key value violates unique constraint") === true
  );
}

export async function POST(request: NextRequest) {
  try {
    const authSupabase = await createAuthServerClient();
    const {
      data: { user },
      error: authError,
    } = await authSupabase.auth.getUser();

    if (authError || !user) {
      throw new AppError(401, "You must sign in before editing your profile.", "unauthorized");
    }

    let body: ProfileBody;
    try {
      body = (await request.json()) as ProfileBody;
    } catch {
      throw new AppError(400, "Invalid JSON in request body.", "invalid_json");
    }
    const usernameResult = validateUsername(body.username);

    if (usernameResult.error || !usernameResult.normalized) {
      throw new AppError(400, usernameResult.error ?? "Invalid username.", "invalid_username");
    }

    const displayName = normalizeDisplayName(body.displayName) ?? usernameResult.normalized;
    const serviceSupabase = createServiceRoleSupabaseClient();
    const updatePayload = {
      display_name: displayName,
      last_active_at: new Date().toISOString(),
      username: usernameResult.normalized,
    };

    const { data, error } = await serviceSupabase
      .from("user_profiles")
      .update(updatePayload)
      .eq("id", user.id)
      .select("username, display_name")
      .single();

    if (error) {
      if (isUniqueViolation(error)) {
        throw new AppError(409, "That username is already taken.", "username_taken");
      }

      throw error;
    }

    const existingMetadata =
      (user.user_metadata as Record<string, unknown> | undefined) ?? {};
    const { error: metadataError } = await serviceSupabase.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...existingMetadata,
          display_name: displayName,
          full_name: displayName,
          name: displayName,
          user_name: usernameResult.normalized,
          username: usernameResult.normalized,
        },
      },
    );

    if (metadataError) {
      console.error(
        `[SkillJury:auth-profile] Metadata sync failed for ${user.id}.`,
        metadataError,
      );
    }

    return NextResponse.json({
      ok: true,
      profile: {
        displayName: data.display_name as string | null,
        username: data.username as string,
      },
    });
  } catch (error) {
    return routeErrorResponse(error, {
      context: "auth-profile",
      fallbackMessage: "Could not update the profile right now.",
    });
  }
}

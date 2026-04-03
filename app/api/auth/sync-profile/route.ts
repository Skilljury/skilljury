import { NextResponse } from "next/server";

import { AppError } from "@/lib/errors/appError";
import { routeErrorResponse } from "@/lib/errors/routeError";
import {
  createAuthServerClient,
  syncUserProfileFromAuthUser,
} from "@/lib/auth/session";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createAuthServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      throw new AppError(
        401,
        "You must finish sign-in before SkillJury can sync your profile.",
        "unauthorized",
      );
    }

    await syncUserProfileFromAuthUser(user);

    const serviceSupabase = createServiceRoleSupabaseClient();
    const { data: profile, error: profileError } = await serviceSupabase
      .from("user_profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    return NextResponse.json({
      needsProfileSetup: !profile?.username,
      ok: true,
    });
  } catch (error) {
    return routeErrorResponse(error, {
      context: "auth-sync-profile",
      fallbackMessage: "SkillJury could not sync your profile right now.",
    });
  }
}

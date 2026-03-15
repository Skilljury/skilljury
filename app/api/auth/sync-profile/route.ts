import { NextResponse } from "next/server";

import {
  createAuthServerClient,
  syncUserProfileFromAuthUser,
} from "@/lib/auth/session";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createAuthServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json(
      {
        error: "You must finish sign-in before SkillJury can sync your profile.",
      },
      { status: 401 },
    );
  }

  await syncUserProfileFromAuthUser(user);

  const serviceSupabase = createServiceRoleSupabaseClient();
  const { data: profile } = await serviceSupabase
    .from("user_profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  return NextResponse.json({
    needsProfileSetup: !profile?.username,
    ok: true,
  });
}

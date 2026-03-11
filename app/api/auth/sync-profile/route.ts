import { NextResponse } from "next/server";

import { createAuthServerClient, syncUserProfileFromAuthUser } from "@/lib/auth/session";

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

  return NextResponse.json({ ok: true });
}

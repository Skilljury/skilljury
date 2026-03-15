import "server-only";

import { redirect } from "next/navigation";

import { getSafeNextPath } from "@/lib/auth/redirects";
import { getCurrentViewer } from "@/lib/auth/session";

export async function requireSignedInUser(nextPath?: string) {
  const viewer = await getCurrentViewer();

  if (!viewer.user) {
    redirect(`/login?next=${encodeURIComponent(getSafeNextPath(nextPath))}`);
  }

  return viewer;
}

export async function requireProfileIdentity(nextPath?: string) {
  const viewer = await requireSignedInUser(nextPath);

  if (!viewer.profile?.username) {
    redirect(`/account/setup?next=${encodeURIComponent(getSafeNextPath(nextPath))}`);
  }

  return viewer;
}

export async function requireModerator(nextPath = "/admin/moderation") {
  const viewer = await requireSignedInUser(nextPath);

  if (!viewer.profile || !["admin", "moderator"].includes(viewer.profile.role)) {
    redirect("/account?error=moderator-only");
  }

  return viewer;
}

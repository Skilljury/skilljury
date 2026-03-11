import { getSiteUrl } from "@/lib/supabase/config";

export function getSafeNextPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/account";
  }

  return value;
}

export function buildAuthRedirectUrl(nextPath?: string | null) {
  const next = getSafeNextPath(nextPath);
  const url = new URL("/auth/callback", getSiteUrl());
  url.searchParams.set("next", next);
  return url.toString();
}

export function buildBrowserAuthCallbackUrl(nextPath: string) {
  if (typeof window === "undefined") {
    return "";
  }

  const url = new URL("/auth/callback", window.location.origin);
  url.searchParams.set("next", nextPath);
  return url.toString();
}

function readBooleanEnv(name: string) {
  const value = process.env[name]?.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes" || value === "on";
}

export function isGoogleAuthEnabled() {
  return readBooleanEnv("NEXT_PUBLIC_GOOGLE_AUTH_ENABLED");
}

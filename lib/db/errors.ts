const RECOVERABLE_CATALOG_ERROR_PATTERNS = [
  "SkillJury could not resolve the Supabase project URL from the environment.",
  "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY.",
  "Missing SUPABASE_SERVICE_ROLE_KEY.",
  "fetch failed",
  "ENOTFOUND",
  "ECONNREFUSED",
  "ETIMEDOUT",
] as const;

export function isMissingRelationError(message: string) {
  return (
    message.includes("relation") ||
    message.includes("schema cache") ||
    message.includes("Could not find")
  );
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") {
      return message;
    }
  }

  return String(error);
}

export function canUsePublicCatalogFallbacks() {
  return (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.SKILLJURY_ALLOW_CATALOG_FALLBACKS === "1"
  );
}

export function isRecoverablePublicCatalogError(error: unknown) {
  const message = getErrorMessage(error);
  return RECOVERABLE_CATALOG_ERROR_PATTERNS.some((pattern) =>
    message.includes(pattern),
  );
}

export function shouldUsePublicCatalogFallback(error: unknown) {
  return canUsePublicCatalogFallbacks() && isRecoverablePublicCatalogError(error);
}

export function logDataAccessError(scope: string, error: { message: string } | unknown) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[SkillJury:${scope}] ${getErrorMessage(error)}`);
  }
}

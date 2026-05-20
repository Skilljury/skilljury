export function isMissingRelationError(message: string) {
  return (
    message.includes("relation") ||
    message.includes("schema cache") ||
    message.includes("Could not find")
  );
}

export function logDataAccessError(scope: string, error: { message: string }) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[SkillJury:${scope}] ${error.message}`);
  }
}

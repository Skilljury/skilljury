export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 32;

const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9_-]{1,30}[a-z0-9])?$/;

export function normalizeUsername(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const sanitized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, USERNAME_MAX_LENGTH);

  return sanitized || null;
}

export function validateUsername(value: string | null | undefined) {
  const normalized = normalizeUsername(value);

  if (!normalized) {
    return {
      error: "Choose a username to continue.",
      normalized: null,
    };
  }

  if (normalized.length < USERNAME_MIN_LENGTH) {
    return {
      error: `Usernames must be at least ${USERNAME_MIN_LENGTH} characters long.`,
      normalized,
    };
  }

  if (!USERNAME_PATTERN.test(normalized)) {
    return {
      error:
        "Use lowercase letters, numbers, hyphens, or underscores, and avoid leading or trailing punctuation.",
      normalized,
    };
  }

  return {
    error: null,
    normalized,
  };
}

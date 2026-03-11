const ANGLED_VALUE = /^<([\s\S]+)>$/;
const TURNSTILE_TEST_SITE_KEY = "1x00000000000000000000AA";
const TURNSTILE_TEST_SECRET_KEY = "1x0000000000000000000000000000000AA";

function sanitizeEnvValue(value: string | undefined): string {
  if (!value) {
    return "";
  }

  const trimmed = value.trim();
  const angledMatch = trimmed.match(ANGLED_VALUE);

  return angledMatch ? angledMatch[1].trim() : trimmed;
}

function decodeBase64Url(input: string): string {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");

  if (typeof atob === "function") {
    return atob(padded);
  }

  return Buffer.from(padded, "base64").toString("utf8");
}

function deriveProjectRefFromJwt(token: string): string | null {
  const segments = token.split(".");

  if (segments.length < 2) {
    return null;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(segments[1])) as {
      ref?: string;
    };

    return payload.ref ?? null;
  } catch {
    return null;
  }
}

function resolveSupabaseUrl(): string {
  const configuredUrl = sanitizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);

  if (configuredUrl.startsWith("https://")) {
    return configuredUrl;
  }

  const anonKey = sanitizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const serviceRoleKey = sanitizeEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const projectRef =
    deriveProjectRefFromJwt(anonKey) ?? deriveProjectRefFromJwt(serviceRoleKey);

  if (!projectRef) {
    throw new Error(
      "SkillJury could not resolve the Supabase project URL from the environment.",
    );
  }

  return `https://${projectRef}.supabase.co`;
}

export function getPublicSupabaseConfig() {
  const url = resolveSupabaseUrl();
  const anonKey = sanitizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  return { url, anonKey };
}

export function getServiceRoleConfig() {
  const url = resolveSupabaseUrl();
  const serviceRoleKey = sanitizeEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY.");
  }

  return { url, serviceRoleKey };
}

export function getSiteUrl() {
  const configuredSiteUrl = sanitizeEnvValue(process.env.NEXT_PUBLIC_SITE_URL);

  if (configuredSiteUrl.startsWith("https://")) {
    return configuredSiteUrl;
  }

  return "http://localhost:3000";
}

export function getTurnstileSiteKey() {
  const siteKey = sanitizeEnvValue(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

  if (siteKey) {
    return siteKey;
  }

  return process.env.NODE_ENV === "production" ? "" : TURNSTILE_TEST_SITE_KEY;
}

export function getTurnstileSecretKey() {
  const secretKey = sanitizeEnvValue(process.env.TURNSTILE_SECRET_KEY);

  if (secretKey) {
    return secretKey;
  }

  return process.env.NODE_ENV === "production" ? "" : TURNSTILE_TEST_SECRET_KEY;
}

export function getAdminEmail() {
  const adminEmail = sanitizeEnvValue(process.env.NEXT_PUBLIC_ADMIN_EMAIL);
  return adminEmail || null;
}

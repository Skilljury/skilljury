import "server-only";

import { getSiteUrl } from "@/lib/supabase/config";

const INDEXNOW_API_URL = "https://www.bing.com/indexnow";
const INDEXNOW_HOST = "www.skilljury.com";

function normalizeSecret(value: string | undefined) {
  return value?.trim() ?? "";
}

function normalizeUrls(urls: string[]) {
  const deduped = new Set<string>();

  for (const url of urls) {
    const trimmed = url.trim();

    if (!trimmed) {
      continue;
    }

    try {
      const parsed = new URL(trimmed);

      if (!["http:", "https:"].includes(parsed.protocol)) {
        continue;
      }

      if (!["skilljury.com", INDEXNOW_HOST].includes(parsed.hostname)) {
        console.error("[SkillJury:indexnow] Ignoring non-SkillJury URL.", url);
        continue;
      }

      deduped.add(buildIndexNowUrl(`${parsed.pathname}${parsed.search}`));
    } catch {
      console.error("[SkillJury:indexnow] Ignoring invalid URL.", url);
    }
  }

  return [...deduped];
}

function getIndexNowKey() {
  return normalizeSecret(process.env.INDEXNOW_KEY);
}

function getInternalSecret() {
  return normalizeSecret(process.env.INTERNAL_SECRET);
}

function getInternalApiBaseUrl() {
  const vercelUrl = normalizeSecret(process.env.VERCEL_URL);

  if (vercelUrl) {
    return vercelUrl.startsWith("http") ? vercelUrl : `https://${vercelUrl}`;
  }

  return getSiteUrl();
}

export function buildIndexNowUrl(pathname: string) {
  return new URL(pathname, `https://${INDEXNOW_HOST}`).toString();
}

export function getIndexNowKeyLocation() {
  const key = getIndexNowKey();
  return key ? buildIndexNowUrl(`/${key}.txt`) : "";
}

export async function submitIndexNow(urls: string[]) {
  const key = getIndexNowKey();

  if (!key) {
    throw new Error("Missing INDEXNOW_KEY.");
  }

  const normalizedUrls = normalizeUrls(urls);

  if (normalizedUrls.length === 0) {
    return 0;
  }

  const response = await fetch(INDEXNOW_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      host: INDEXNOW_HOST,
      key,
      keyLocation: getIndexNowKeyLocation(),
      urlList: normalizedUrls,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Bing IndexNow failed: ${response.status} ${body}`.trim());
  }

  return normalizedUrls.length;
}

export async function notifyIndexNow(urls: string[]) {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const normalizedUrls = normalizeUrls(urls);

  if (normalizedUrls.length === 0) {
    return;
  }

  const internalSecret = getInternalSecret();

  if (!internalSecret) {
    console.error("[SkillJury:indexnow] Missing INTERNAL_SECRET.");
    return;
  }

  try {
    const response = await fetch(`${getInternalApiBaseUrl()}/api/indexnow`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": internalSecret,
      },
      body: JSON.stringify({ urls: normalizedUrls }),
      cache: "no-store",
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(
        `Internal IndexNow route failed: ${response.status} ${body}`.trim(),
      );
    }
  } catch (error) {
    console.error("[SkillJury:indexnow] Failed to submit URLs.", error);
  }
}

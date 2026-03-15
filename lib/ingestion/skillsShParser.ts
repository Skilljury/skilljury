import { XMLParser } from "fast-xml-parser";

type InstalledAgent = {
  name: string;
  slug: string;
  installCount: number;
};

export type SecurityAuditStatus =
  | "critical"
  | "fail"
  | "high_risk"
  | "pass"
  | "safe"
  | "warn";

export type ParsedSecurityAudits = {
  gen?: SecurityAuditStatus;
  socket?: SecurityAuditStatus;
  snyk?: SecurityAuditStatus;
};

export type ParsedSkillPage = {
  sourceSlug: string;
  sourceName: string;
  sourceSkillId: string;
  name: string;
  slugBase: string;
  shortSummary: string | null;
  longDescription: string | null;
  canonicalSourceUrl: string;
  repositoryUrl: string | null;
  installCommand: string | null;
  weeklyInstalls: number | null;
  githubStars: number | null;
  firstSeenAt: string | null;
  installedAgents: InstalledAgent[];
  securityAudits: ParsedSecurityAudits;
};

const parser = new XMLParser({
  ignoreAttributes: false,
});

function decodeHtmlEntities(input: string) {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

function stripHtml(input: string) {
  return decodeHtmlEntities(
    input
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<\/li>/gi, "\n")
      .replace(/<li>/gi, "- ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toInteger(value: string | null) {
  if (!value) {
    return null;
  }

  const normalized = value.replace(/,/g, "").trim();
  const parsed = Number.parseInt(normalized, 10);

  return Number.isNaN(parsed) ? null : parsed;
}

function extractByRegex(html: string, expression: RegExp) {
  const match = html.match(expression);

  return match?.[1]?.trim() ?? null;
}

function extractMetricValue(html: string, label: string) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  return extractByRegex(
    html,
    new RegExp(
      `${escapedLabel}<\\/span><\\/div><div[^>]*>([^<]+)<\\/div>`,
      "i",
    ),
  );
}

function extractContentSection(html: string) {
  const match = html.match(
    /<\/button><\/div>([\s\S]*?)<div class="[^"]*lg:col-span-3[^"]*">/i,
  );

  return match?.[1] ?? "";
}

function extractParagraphs(html: string) {
  return [...html.matchAll(/<p>([\s\S]*?)<\/p>/gi)]
    .map((match) => stripHtml(match[1]))
    .filter(Boolean);
}

function extractListItems(html: string) {
  return [...html.matchAll(/<li>([\s\S]*?)<\/li>/gi)]
    .map((match) => stripHtml(match[1]))
    .filter(Boolean);
}

function normalizeFirstSeen(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
}

function normalizeSecurityAuditLabel(
  value: string,
): keyof ParsedSecurityAudits | null {
  const normalized = stripHtml(value).toLowerCase();

  if (normalized.includes("gen agent trust hub")) {
    return "gen";
  }

  if (normalized.includes("socket")) {
    return "socket";
  }

  if (normalized.includes("snyk")) {
    return "snyk";
  }

  return null;
}

function normalizeSecurityAuditStatus(
  value: string,
): SecurityAuditStatus | null {
  const normalized = stripHtml(value)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

  switch (normalized) {
    case "pass":
    case "fail":
    case "safe":
    case "critical":
      return normalized;
    case "warn":
    case "warning":
      return "warn";
    case "high risk":
    case "high-risk":
    case "high_risk":
      return "high_risk";
    default:
      return null;
  }
}

function extractSecurityAudits(html: string): ParsedSecurityAudits {
  const audits: ParsedSecurityAudits = {};

  for (const match of html.matchAll(
    /href="[^"]*\/security\/[^"]+"[^>]*>[\s\S]*?<span[^>]*>([^<]+)<\/span>\s*<span[^>]*>([^<]+)<\/span>/gi,
  )) {
    const key = normalizeSecurityAuditLabel(match[1]);
    const status = normalizeSecurityAuditStatus(match[2]);

    if (!key || !status || audits[key]) {
      continue;
    }

    audits[key] = status;
  }

  return audits;
}

function extractInstalledAgents(html: string): InstalledAgent[] {
  const block = extractByRegex(
    html,
    /Installed on<\/div><div class="divide-y[^"]*">([\s\S]*?)<\/div><\/div><\/div><\/div>/i,
  );

  if (!block) {
    return [];
  }

  return [...block.matchAll(/<span class="text-foreground">([^<]+)<\/span><span class="text-muted-foreground font-mono">([\d,]+)<\/span>/gi)]
    .map((match) => ({
      name: stripHtml(match[1]),
      slug: slugify(stripHtml(match[1])),
      installCount: toInteger(match[2]) ?? 0,
    }))
    .filter((agent) => agent.name.length > 0);
}

export async function fetchSkillsShSitemap() {
  const response = await fetch("https://skills.sh/sitemap.xml", {
    headers: {
      "user-agent": "SkillJuryBot/0.1",
    },
    signal: AbortSignal.timeout(15_000),
    next: {
      revalidate: 0,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch skills.sh sitemap: ${response.status}`);
  }

  const rawXml = await response.text();
  const parsed = parser.parse(rawXml) as {
    urlset?: {
      url?: Array<{ loc?: string }> | { loc?: string };
    };
  };

  const rawUrls = parsed.urlset?.url ?? [];
  const urls = (Array.isArray(rawUrls) ? rawUrls : [rawUrls])
    .map((entry) => entry?.loc?.trim())
    .filter((value): value is string => Boolean(value));

  return {
    rawXml,
    urls,
  };
}

export async function fetchSkillPageHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "SkillJuryBot/0.1",
    },
    signal: AbortSignal.timeout(15_000),
    next: {
      revalidate: 0,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch skill page ${url}: ${response.status}`);
  }

  return response.text();
}

export function parseSkillsShSkillPage(
  canonicalUrl: string,
  html: string,
): ParsedSkillPage {
  const url = new URL(canonicalUrl);
  const segments = url.pathname.split("/").filter(Boolean);

  if (segments.length < 3) {
    throw new Error(`Unexpected skills.sh URL format: ${canonicalUrl}`);
  }

  const sourceSlug = `${segments[0]}/${segments[1]}`;
  const sourceSkillId = segments[2];
  const name = stripHtml(
    extractByRegex(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i) ?? sourceSkillId,
  );
  const contentSection = extractContentSection(html);
  const paragraphs = extractParagraphs(contentSection);
  const listItems = extractListItems(contentSection);
  const repositoryUrl = extractByRegex(
    html,
    /<a href="(https:\/\/github\.com\/[^"]+)"[^>]*title="[^"]+"/i,
  );
  const installCommand = stripHtml(
    extractByRegex(html, /<code class="truncate">([\s\S]*?)<\/code>/i) ?? "",
  ).replace(/^\$\s*/, "");
  const summaryParagraph = paragraphs[0] ?? null;
  const descriptionParts = [...paragraphs, ...listItems.map((item) => `- ${item}`)];
  const longDescription = descriptionParts.length
    ? descriptionParts.join("\n\n")
    : null;

  return {
    sourceSlug,
    sourceName: sourceSlug,
    sourceSkillId,
    name,
    slugBase: slugify(sourceSkillId),
    shortSummary: summaryParagraph,
    longDescription,
    canonicalSourceUrl:
      extractByRegex(html, /<link rel="canonical" href="([^"]+)"/i) ??
      canonicalUrl,
    repositoryUrl,
    installCommand: installCommand || null,
    weeklyInstalls: toInteger(extractMetricValue(html, "Weekly Installs")),
    githubStars: toInteger(extractMetricValue(html, "GitHub Stars")),
    firstSeenAt: normalizeFirstSeen(extractMetricValue(html, "First Seen")),
    installedAgents: extractInstalledAgents(html),
    securityAudits: extractSecurityAudits(html),
  };
}

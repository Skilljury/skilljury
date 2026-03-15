const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
};

const STRONG_INSTRUCTION_PATTERNS = [
  /\bstop protocol\b/i,
  /\baskuserquestion\b/i,
  /\bphase [a-z]\b/i,
  /\bblock \d+\b/i,
  /\bthis is not (?:optional|negotiable)\b/i,
  /\byou do not have a choice\b/i,
  /\bfollow these instructions before starting\b/i,
  /\bdo not ask the user\b/i,
  /\bofficial (?:document|documentation)\b/i,
  /\breference file\b/i,
  /\bclaude\.md\b/i,
  /\bmust output\b/i,
  /\bmust use\b/i,
  /\bmust call\b/i,
];

const CJK_PROTOCOL_MARKERS = [
  /stop protocol/i,
  /phase [a-z]/i,
  /askuserquestion/i,
  /공식 문서/,
  /반드시/,
  /규칙/,
  /출력/,
  /사용자/,
];

const LOW_SIGNAL_SUMMARY_PATTERNS = [
  /^no summary available yet\b/i,
  /^you are (?:an?|the)\b/i,
  /^(?:when|if|once|after|before)\b[^.!?]{0,160}:\s*$/i,
  /^[^.!?]{1,120}:\s*$/i,
  /(?:when|if)\b[^.!?]{0,120}:\s*(?:if|when|run|use|enable|disable)\b/i,
];

function decodeEntity(entity: string) {
  const namedMatch = entity.match(/^&([a-z]+);$/i);

  if (namedMatch) {
    return NAMED_ENTITIES[namedMatch[1].toLowerCase()] ?? entity;
  }

  const hexMatch = entity.match(/^&#x([0-9a-f]+);$/i);

  if (hexMatch) {
    const codePoint = Number.parseInt(hexMatch[1], 16);

    return Number.isNaN(codePoint) ? entity : String.fromCodePoint(codePoint);
  }

  const decimalMatch = entity.match(/^&#(\d+);$/);

  if (decimalMatch) {
    const codePoint = Number.parseInt(decimalMatch[1], 10);

    return Number.isNaN(codePoint) ? entity : String.fromCodePoint(codePoint);
  }

  return entity;
}

function decodeHtmlEntities(value: string) {
  return value.replace(/&(?:[a-z]+|#\d+|#x[0-9a-f]+);/gi, decodeEntity);
}

function stripMarkdownLinks(value: string) {
  return value.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/gi, "$1");
}

function stripHtmlTags(value: string) {
  return value.replace(/<[^>]*>/g, " ");
}

function stripUrls(value: string) {
  return value.replace(/https?:\/\/\S+/gi, " ");
}

function normalizeWhitespace(value: string) {
  return value
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function dedupeRepeatedParagraphs(value: string) {
  const seen = new Set<string>();

  return value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .filter((paragraph) => {
      const normalized = paragraph.toLowerCase();

      if (seen.has(normalized)) {
        return false;
      }

      seen.add(normalized);
      return true;
    })
    .join("\n\n");
}

function dedupeRepeatedSentences(value: string) {
  const sentences = value
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"'(@\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af-])/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (sentences.length <= 1) {
    return value;
  }

  const seen = new Set<string>();

  return sentences
    .filter((sentence) => {
      const normalized = sentence.toLowerCase();

      if (seen.has(normalized)) {
        return false;
      }

      seen.add(normalized);
      return true;
    })
    .join(" ");
}

function countPatternMatches(value: string, patterns: RegExp[]) {
  return patterns.reduce(
    (total, pattern) => total + (pattern.test(value) ? 1 : 0),
    0,
  );
}

function isProtocolLikeParagraph(value: string) {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return false;
  }

  if (countPatternMatches(normalized, STRONG_INSTRUCTION_PATTERNS) >= 2) {
    return true;
  }

  const hasCjk = /[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/.test(normalized);

  if (hasCjk && countPatternMatches(normalized, CJK_PROTOCOL_MARKERS) >= 2) {
    return true;
  }

  return false;
}

function cleanRawText(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const decoded = normalizeWhitespace(
    stripUrls(stripHtmlTags(stripMarkdownLinks(decodeHtmlEntities(value)))),
  );

  const withoutRepeatedParagraphs = dedupeRepeatedParagraphs(decoded);
  const filteredParagraphs = withoutRepeatedParagraphs
    .split(/\n{2,}/)
    .map((paragraph) => normalizeWhitespace(paragraph))
    .filter(Boolean)
    .filter((paragraph) => !isProtocolLikeParagraph(paragraph));

  const filtered = filteredParagraphs.join("\n\n");

  return normalizeWhitespace(dedupeRepeatedSentences(filtered));
}

function trimText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  const trimmed = value.slice(0, maxLength);
  const boundary = Math.max(
    trimmed.lastIndexOf(". "),
    trimmed.lastIndexOf("! "),
    trimmed.lastIndexOf("? "),
    trimmed.lastIndexOf(" "),
  );

  const candidate = boundary > maxLength * 0.6 ? trimmed.slice(0, boundary) : trimmed;
  return `${candidate.trimEnd()}...`;
}

function isLowSignalCatalogCopy(value: string) {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return true;
  }

  if (normalized.length < 40) {
    return true;
  }

  return LOW_SIGNAL_SUMMARY_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function labelFromSlug(slug: string | null | undefined) {
  if (!slug) {
    return "Unknown";
  }

  return slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function cleanCatalogLabel(
  value: string | null | undefined,
  fallback = "Unknown",
) {
  const cleaned = cleanRawText(value).replace(/\s+/g, " ").trim();

  if (!cleaned) {
    return fallback;
  }

  return trimText(cleaned, 80);
}

export function cleanCatalogSummary(value: string | null | undefined) {
  const cleaned = cleanRawText(value).replace(/\s+/g, " ").trim();

  if (isLowSignalCatalogCopy(cleaned)) {
    return null;
  }

  return trimText(cleaned, 320);
}

function splitSentences(value: string) {
  return value
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"'(@-])/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

export function cleanCatalogDescription(
  value: string | null | undefined,
  fallbackSummary?: string | null,
) {
  const cleaned = cleanRawText(value);
  const fallback = cleanCatalogSummary(fallbackSummary);

  if (!cleaned) {
    return fallback;
  }

  const paragraphs = cleaned
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const usefulParagraphs = paragraphs.filter(
    (paragraph) => !isLowSignalCatalogCopy(paragraph) || paragraph.length >= 140,
  );

  let excerpt = "";

  if (usefulParagraphs.length > 1) {
    excerpt = usefulParagraphs
      .slice(0, 4)
      .map((paragraph) => trimText(paragraph, 280))
      .join("\n\n");
  } else {
    const sentences = splitSentences(usefulParagraphs[0] ?? cleaned);
    excerpt = sentences.slice(0, 8).join(" ");
  }

  if (!excerpt || isLowSignalCatalogCopy(excerpt)) {
    return fallback;
  }

  return trimText(excerpt, 1400);
}

export function isMeaningfulCatalogSummary(value: string | null | undefined) {
  const cleaned = cleanCatalogSummary(value);
  return Boolean(cleaned && cleaned.length >= 80);
}

export function isGenericCatalogName(value: string | null | undefined) {
  const normalized = cleanCatalogLabel(value, "").toLowerCase();
  return ["demo", "example", "fix", "sample", "temp", "test"].includes(normalized);
}

export function isSuspiciousCatalogLabel(value: string | null | undefined) {
  const normalized = cleanCatalogLabel(value, "").toLowerCase();

  return /^(click here|click me|learn more|read more|untitled|unknown)$/.test(normalized);
}

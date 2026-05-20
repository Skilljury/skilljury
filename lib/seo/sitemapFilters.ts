export type SkillSitemapIndexabilityEntry = {
  approvedReviewCount: number;
  lastModified: string | null;
  longDescription?: string | null;
  shortSummary?: string | null;
  slug: string;
};

export type SourceSitemapIndexabilityEntry = {
  skillCount: number;
  slug: string;
};

function hasMeaningfulText(value: string | null | undefined) {
  return Boolean(value?.replace(/\s+/g, " ").trim());
}

export function isIndexableSkillSitemapEntry(entry: SkillSitemapIndexabilityEntry) {
  return (
    hasMeaningfulText(entry.shortSummary) ||
    hasMeaningfulText(entry.longDescription) ||
    entry.approvedReviewCount > 0
  );
}

export function isIndexableSourceSitemapEntry(entry: SourceSitemapIndexabilityEntry) {
  return entry.skillCount > 3;
}

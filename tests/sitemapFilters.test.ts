import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  isIndexableSkillSitemapEntry,
  isIndexableSourceSitemapEntry,
} from "../lib/seo/sitemapFilters";

describe("sitemap indexability filters", () => {
  it("excludes thin skill pages with no summaries and no approved reviews", () => {
    assert.equal(
      isIndexableSkillSitemapEntry({
        approvedReviewCount: 0,
        lastModified: null,
        longDescription: null,
        shortSummary: null,
        slug: "thin-skill",
      }),
      false,
    );
  });

  it("includes skill pages with source copy or approved reviews", () => {
    assert.equal(
      isIndexableSkillSitemapEntry({
        approvedReviewCount: 0,
        lastModified: null,
        longDescription: null,
        shortSummary: "Does something specific.",
        slug: "described-skill",
      }),
      true,
    );
    assert.equal(
      isIndexableSkillSitemapEntry({
        approvedReviewCount: 1,
        lastModified: null,
        longDescription: null,
        shortSummary: null,
        slug: "reviewed-skill",
      }),
      true,
    );
  });

  it("matches source page metadata by indexing only sources with more than three skills", () => {
    assert.equal(isIndexableSourceSitemapEntry({ skillCount: 3, slug: "thin-source" }), false);
    assert.equal(isIndexableSourceSitemapEntry({ skillCount: 4, slug: "rich-source" }), true);
  });
});

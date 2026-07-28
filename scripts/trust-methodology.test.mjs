import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

test("trust methodology explains evidence and limits without overstating verification", async () => {
  const pageSource = await readFile(join(process.cwd(), "app/methodology/page.tsx"), "utf8");
  const footerSource = await readFile(join(process.cwd(), "components/layout/SiteFooter.tsx"), "utf8");
  const sitemapSource = await readFile(join(process.cwd(), "app/sitemap.ts"), "utf8");

  assert.match(pageSource, /What a verified record means/);
  assert.match(pageSource, /not warranties, endorsements/i);
  assert.match(pageSource, /missing warning is not a clean bill of health/i);
  assert.match(pageSource, /How to reproduce the evidence/);
  assert.match(pageSource, /exact version or commit/i);
  assert.match(pageSource, /distinguish observed facts from inference/i);
  assert.doesNotMatch(pageSource, /guaranteed safe/i);
  assert.match(footerSource, /href="\/methodology"/);
  assert.match(sitemapSource, /pathname: "\/methodology"/);
});

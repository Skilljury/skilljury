import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const skillPage = await readFile(new URL("../app/skills/[skillSlug]/page.tsx", import.meta.url), "utf8");

test("skill pages define route-specific metadata", () => {
  assert.match(skillPage, /export async function generateMetadata/);
  assert.match(skillPage, /canonical:\s*`https:\/\/www\.skilljury\.com\/skills\/\$\{skillSlug\}`/);
  assert.match(skillPage, /title:\s*`\$\{skill\.name\}[^`]*SkillJury`/);
});

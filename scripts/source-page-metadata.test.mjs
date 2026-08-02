import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sourcePage = await readFile(new URL("../app/sources/[sourceSlug]/page.tsx", import.meta.url), "utf8");

test("source pages define route-specific metadata", () => {
  assert.match(sourcePage, /export async function generateMetadata/);
  assert.match(sourcePage, /canonical:\s*`https:\/\/www\.skilljury\.com\/sources\/\$\{[^}]+\}`/);
  assert.match(sourcePage, /title:\s*`\$\{source\.name\}[^`]*SkillJury`/);
});

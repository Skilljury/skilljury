import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const skillPage = await readFile(new URL("../app/skills/[skillSlug]/page.tsx", import.meta.url), "utf8");

test("skill pages define route-specific metadata", () => {
  assert.match(skillPage, /export async function generateMetadata/);
  assert.match(skillPage, /canonical:\s*`https:\/\/www\.skilljury\.com\/skills\/\$\{skillSlug\}`/);
  assert.match(skillPage, /title:\s*`\$\{skill\.name\}[^`]*SkillJury`/);
});

test("legacy recovery skill pages explicitly disclose missing immutable provenance", () => {
  assert.match(skillPage, /Immutable provenance unavailable/);
  assert.match(skillPage, /exact evaluated commit, skill path, artifact checksum, and scanner versions were not preserved/);
  assert.match(skillPage, /must not be treated as proof of the current upstream artifact/);
});

test("legacy audit evidence is labeled historical in UI and metadata", () => {
  assert.match(skillPage, /Historical security audit signals/);
  assert.match(skillPage, /historical security-audit snapshot signals/);
  assert.doesNotMatch(skillPage, />Security audit signals</);
});

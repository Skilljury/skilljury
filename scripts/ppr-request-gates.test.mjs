import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const requestBoundLayouts = [
  "app/skills/[skillSlug]/layout.tsx",
  "app/agents/[agentSlug]/layout.tsx",
];

for (const path of requestBoundLayouts) {
  test(`${path} opts its dynamic route out of PPR resumption`, async () => {
    const source = await readFile(new URL(`../${path}`, import.meta.url), "utf8").catch(
      () => "",
    );

    assert.match(
      source,
      /import\s*\{\s*connection\s*\}\s*from\s*["']next\/server["'];/,
      "route layout must import connection() from next/server",
    );

    assert.match(
      source,
      /export\s+default\s+async\s+function[\s\S]{0,500}?await\s+connection\(\);/,
      "route layout must await connection() before rendering children",
    );
  });
}

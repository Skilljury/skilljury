import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const requestBoundRoutes = [
  {
    componentName: "SkillPage",
    path: "app/skills/[skillSlug]/page.tsx",
  },
  {
    componentName: "AgentPage",
    path: "app/agents/[agentSlug]/page.tsx",
  },
];

for (const route of requestBoundRoutes) {
  test(`${route.path} opts out of PPR resumption`, async () => {
    const source = await readFile(new URL(`../${route.path}`, import.meta.url), "utf8");

    assert.match(
      source,
      /import\s*\{\s*connection\s*\}\s*from\s*["']next\/server["'];/,
      "route must import connection() from next/server",
    );

    const escapedName = route.componentName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const componentPattern = new RegExp(
      `export\\s+default\\s+async\\s+function\\s+${escapedName}[\\s\\S]{0,500}?await\\s+connection\\(\\);`,
    );

    assert.match(
      source,
      componentPattern,
      "route must await connection() at the page boundary before rendering its Suspense tree",
    );
  });
}

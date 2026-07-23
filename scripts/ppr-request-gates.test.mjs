import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { patchNextAppRender } from "./patch-next-ppr-resume.mjs";

const vulnerableStatement =
  "const serveStreamingMetadata = !!ctx.renderOpts.serveStreamingMetadata;";
const fixedStatement =
  "const serveStreamingMetadata = getServeStreamingMetadata(ctx.renderOpts);";
const vulnerableAppRenderFixture = `function NonIndex() {}
/**
 * This is used by server actions & client-side navigations to generate RSC data.
 */
async function generateDynamicRSCPayload(ctx) {
  ${vulnerableStatement}
  return serveStreamingMetadata;
}
async function getRSCPayload(tree, ctx) {
  ${vulnerableStatement}
  return serveStreamingMetadata;
}
async function getErrorRSCPayload(tree, ctx) {
  ${vulnerableStatement}
  return serveStreamingMetadata;
}
`;

async function withNextFixture(source, run) {
  const projectRoot = await mkdtemp(join(tmpdir(), "skilljury-next-ppr-patch-"));
  const nextRoot = join(projectRoot, "node_modules", "next");
  const appRenderPaths = [
    join(nextRoot, "dist", "server", "app-render", "app-render.js"),
    join(nextRoot, "dist", "esm", "server", "app-render", "app-render.js"),
  ];
  try {
    for (const appRenderPath of appRenderPaths) {
      await mkdir(join(appRenderPath, ".."), { recursive: true });
    }
    await writeFile(join(nextRoot, "package.json"), JSON.stringify({ name: "next", version: "16.2.3" }), "utf8");
    await Promise.all(appRenderPaths.map((appRenderPath) => writeFile(appRenderPath, source, "utf8")));
    await run({ appRenderPaths, projectRoot });
  } finally {
    await rm(projectRoot, { recursive: true, force: true });
  }
}

test("patches both CommonJS and ESM Next.js PPR metadata resume bundles and is idempotent", async () => {
  await withNextFixture(vulnerableAppRenderFixture, async ({ appRenderPaths, projectRoot }) => {
    const firstResult = await patchNextAppRender({ projectRoot, logger: null });
    assert.equal(firstResult, "patched");

    for (const appRenderPath of appRenderPaths) {
      const patchedSource = await readFile(appRenderPath, "utf8");
      assert.match(patchedSource, /function getServeStreamingMetadata\(renderOpts\)/);
      assert.match(patchedSource, /typeof renderOpts\.postponed === ["']string["']/);
      assert.equal(patchedSource.split(fixedStatement).length - 1, 3);
      assert.doesNotMatch(patchedSource, /const serveStreamingMetadata = !!ctx\.renderOpts\.serveStreamingMetadata;/);
    }

    const secondResult = await patchNextAppRender({ projectRoot, logger: null });
    assert.equal(secondResult, "already-patched");
  });
});

test("refuses to patch an unexpected number of vulnerable call sites", async () => {
  const unknownLayout = vulnerableAppRenderFixture.replace(vulnerableStatement, fixedStatement);
  await withNextFixture(unknownLayout, async ({ appRenderPaths, projectRoot }) => {
    await assert.rejects(patchNextAppRender({ projectRoot, logger: null }), /Expected three vulnerable metadata-resume statements.*found 2/);
    for (const appRenderPath of appRenderPaths) {
      assert.equal(await readFile(appRenderPath, "utf8"), unknownLayout);
    }
  });
});

test("refuses to patch when the framework insertion anchor changes", async () => {
  const unknownLayout = vulnerableAppRenderFixture.replace("This is used by server actions & client-side navigations", "Framework internals changed");
  await withNextFixture(unknownLayout, async ({ appRenderPaths, projectRoot }) => {
    await assert.rejects(patchNextAppRender({ projectRoot, logger: null }), /Could not find the safe helper insertion point/);
    for (const appRenderPath of appRenderPaths) {
      assert.equal(await readFile(appRenderPath, "utf8"), unknownLayout);
    }
  });
});

test("recovery routes keep stable matching PPR suspense roots", async () => {
  const routeFiles = ["app/skills/[skillSlug]/page.tsx", "app/sources/[sourceSlug]/page.tsx"];
  for (const routeFile of routeFiles) {
    const source = await readFile(join(process.cwd(), routeFile), "utf8");
    assert.doesNotMatch(source, /\bnotFound\s*\(/, `${routeFile} must render a stable unavailable state`);
    assert.match(source, /UnavailableSnapshotRecord/, `${routeFile} must render the unavailable snapshot state`);
    assert.match(source, /<Suspense\b/, `${routeFile} must isolate uncached route params behind Suspense`);
    assert.match(source, /mx-auto flex w-full max-w-6xl flex-col gap-8/, `${routeFile} must use the same outer div root for fallback and resolved content`);
    assert.doesNotMatch(source, /return\s*\(\s*<>/, `${routeFile} resolved content must not switch from a div fallback to a fragment root`);
  }
});

test("recovery homepage distinguishes aggregate snapshot counts from browsable records", async () => {
  const source = await readFile(join(process.cwd(), "app/page.tsx"), "utf8");
  assert.match(source, /aggregate snapshot covers/);
  assert.match(source, /Fully browsable/);
  assert.doesNotMatch(source, /Browse a verified recovery snapshot of \{EMERGENCY_SKILL_COUNT/);
});

test("root metadata describes the current recovery experience truthfully", async () => {
  const source = await readFile(join(process.cwd(), "lib/seo/metadata.ts"), "utf8");
  assert.match(source, /read-only recovery catalog/i);
  assert.match(source, /25 fully browsable verified records/i);
  assert.doesNotMatch(source, /SkillJury is a live directory/);
  assert.doesNotMatch(source, /Browse community reviews/);
});

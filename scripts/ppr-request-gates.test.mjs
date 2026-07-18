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
  const appRenderPath = join(nextRoot, "dist", "server", "app-render", "app-render.js");
  try {
    await mkdir(join(nextRoot, "dist", "server", "app-render"), { recursive: true });
    await writeFile(join(nextRoot, "package.json"), JSON.stringify({ name: "next", version: "16.2.3" }), "utf8");
    await writeFile(appRenderPath, source, "utf8");
    await run({ appRenderPath, projectRoot });
  } finally {
    await rm(projectRoot, { recursive: true, force: true });
  }
}

test("patches all Next.js PPR metadata resume call sites and is idempotent", async () => {
  await withNextFixture(vulnerableAppRenderFixture, async ({ appRenderPath, projectRoot }) => {
    const firstResult = await patchNextAppRender({ projectRoot, logger: null });
    const patchedSource = await readFile(appRenderPath, "utf8");
    assert.equal(firstResult, "patched");
    assert.match(patchedSource, /function getServeStreamingMetadata\(renderOpts\)/);
    assert.match(patchedSource, /typeof renderOpts\.postponed === ["']string["']/);
    assert.equal(patchedSource.split(fixedStatement).length - 1, 3);
    assert.doesNotMatch(patchedSource, /const serveStreamingMetadata = !!ctx\.renderOpts\.serveStreamingMetadata;/);
    const secondResult = await patchNextAppRender({ projectRoot, logger: null });
    assert.equal(secondResult, "already-patched");
  });
});

test("refuses to patch an unexpected number of vulnerable call sites", async () => {
  const unknownLayout = vulnerableAppRenderFixture.replace(vulnerableStatement, fixedStatement);
  await withNextFixture(unknownLayout, async ({ appRenderPath, projectRoot }) => {
    await assert.rejects(patchNextAppRender({ projectRoot, logger: null }), /Expected three vulnerable metadata-resume statements.*found 2/);
    assert.equal(await readFile(appRenderPath, "utf8"), unknownLayout);
  });
});

test("refuses to patch when the framework insertion anchor changes", async () => {
  const unknownLayout = vulnerableAppRenderFixture.replace("This is used by server actions & client-side navigations", "Framework internals changed");
  await withNextFixture(unknownLayout, async ({ appRenderPath, projectRoot }) => {
    await assert.rejects(patchNextAppRender({ projectRoot, logger: null }), /Could not find the safe helper insertion point/);
    assert.equal(await readFile(appRenderPath, "utf8"), unknownLayout);
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

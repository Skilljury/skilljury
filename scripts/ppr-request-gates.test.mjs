import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const patchModuleUrl = new URL("./patch-next-ppr-resume.mjs", import.meta.url);

const vulnerableAppRenderFixture = `function NonIndex() {}
/**
 * This is used by server actions & client-side navigations to generate RSC data.
 */
async function generateDynamicRSCPayload(ctx) {
  const serveStreamingMetadata = !!ctx.renderOpts.serveStreamingMetadata;
  return serveStreamingMetadata;
}
async function getRSCPayload(tree, ctx) {
  const serveStreamingMetadata = !!ctx.renderOpts.serveStreamingMetadata;
  return serveStreamingMetadata;
}
async function getErrorRSCPayload(tree, ctx) {
  const serveStreamingMetadata = !!ctx.renderOpts.serveStreamingMetadata;
  return serveStreamingMetadata;
}
`;

test("patches Next.js PPR resumes to preserve the prerendered metadata tree shape", async () => {
  const patchModule = await import(`${patchModuleUrl.href}?test=${Date.now()}`).catch(
    () => ({}),
  );

  assert.equal(
    typeof patchModule.patchNextAppRender,
    "function",
    "patch-next-ppr-resume.mjs must export patchNextAppRender()",
  );

  const projectRoot = await mkdtemp(join(tmpdir(), "skilljury-next-ppr-patch-"));
  const nextRoot = join(projectRoot, "node_modules", "next");
  const appRenderPath = join(nextRoot, "dist", "server", "app-render", "app-render.js");

  try {
    await mkdir(join(nextRoot, "dist", "server", "app-render"), { recursive: true });
    await writeFile(
      join(nextRoot, "package.json"),
      JSON.stringify({ name: "next", version: "16.2.3" }),
      "utf8",
    );
    await writeFile(appRenderPath, vulnerableAppRenderFixture, "utf8");

    const firstResult = await patchModule.patchNextAppRender({
      projectRoot,
      logger: null,
    });
    const patchedSource = await readFile(appRenderPath, "utf8");

    assert.equal(firstResult, "patched");
    assert.match(patchedSource, /function getServeStreamingMetadata\(renderOpts\)/);
    assert.match(
      patchedSource,
      /typeof renderOpts\.postponed === ["']string["']/,
    );
    assert.equal(
      patchedSource.match(
        /const serveStreamingMetadata = getServeStreamingMetadata\(ctx\.renderOpts\);/g,
      )?.length,
      3,
    );
    assert.doesNotMatch(
      patchedSource,
      /const serveStreamingMetadata = !!ctx\.renderOpts\.serveStreamingMetadata;/,
    );

    const secondResult = await patchModule.patchNextAppRender({
      projectRoot,
      logger: null,
    });
    assert.equal(secondResult, "already-patched");
  } finally {
    await rm(projectRoot, { recursive: true, force: true });
  }
});

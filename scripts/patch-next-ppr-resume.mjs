import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join, resolve } from "node:path";

const vulnerableStatement =
  "const serveStreamingMetadata = !!ctx.renderOpts.serveStreamingMetadata;";
const fixedStatement =
  "const serveStreamingMetadata = getServeStreamingMetadata(ctx.renderOpts);";
const helperSignature = "function getServeStreamingMetadata(renderOpts)";
const insertionAnchor = `/**
 * This is used by server actions & client-side navigations to generate RSC data`;
const helperSource = `/**
 * PPR resumes must render the same metadata tree shape as the prerendered shell.
 * This is the minimal runtime fix from upstream Next.js PR #94630.
 */
function getServeStreamingMetadata(renderOpts) {
    if (typeof renderOpts.postponed === "string") {
        return true;
    }
    return !!renderOpts.serveStreamingMetadata;
}
`;

function countOccurrences(source, value) {
  return source.split(value).length - 1;
}

export async function patchNextAppRender({
  projectRoot = process.cwd(),
  logger = console,
} = {}) {
  const nextRoot = join(projectRoot, "node_modules", "next");
  const nextPackagePath = join(nextRoot, "package.json");
  const appRenderPath = join(
    nextRoot,
    "dist",
    "server",
    "app-render",
    "app-render.js",
  );
  const nextPackage = JSON.parse(await readFile(nextPackagePath, "utf8"));
  const source = await readFile(appRenderPath, "utf8");
  const vulnerableCount = countOccurrences(source, vulnerableStatement);

  if (source.includes(helperSignature)) {
    if (vulnerableCount !== 0) {
      throw new Error(
        `Next.js ${nextPackage.version} contains both patched and vulnerable metadata-resume code. Refusing a partial patch.`,
      );
    }

    logger?.log(
      `[postinstall] Next.js ${nextPackage.version} already contains the PPR metadata-resume patch.`,
    );
    return "already-patched";
  }

  if (vulnerableCount !== 3) {
    throw new Error(
      `Expected three vulnerable metadata-resume statements in Next.js ${nextPackage.version}, found ${vulnerableCount}. Review upstream PR #94630 before upgrading Next.js.`,
    );
  }

  if (!source.includes(insertionAnchor)) {
    throw new Error(
      `Could not find the safe helper insertion point in Next.js ${nextPackage.version}. Refusing to patch an unknown framework layout.`,
    );
  }

  const patchedSource = source
    .replace(insertionAnchor, `${helperSource}${insertionAnchor}`)
    .split(vulnerableStatement)
    .join(fixedStatement);

  if (
    !patchedSource.includes(helperSignature) ||
    countOccurrences(patchedSource, fixedStatement) !== 3 ||
    countOccurrences(patchedSource, vulnerableStatement) !== 0
  ) {
    throw new Error(
      `Next.js ${nextPackage.version} PPR metadata-resume patch verification failed.`,
    );
  }

  await writeFile(appRenderPath, patchedSource, "utf8");
  logger?.log(
    `[postinstall] Applied the upstream PPR metadata-resume fix to Next.js ${nextPackage.version} (PR #94630).`,
  );
  return "patched";
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : null;
const currentPath = fileURLToPath(import.meta.url);

if (invokedPath === currentPath) {
  patchNextAppRender().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}

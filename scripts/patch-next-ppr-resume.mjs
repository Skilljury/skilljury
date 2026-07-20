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

function prepareAppRenderPatch({ source, nextVersion, bundleLabel }) {
  const vulnerableCount = countOccurrences(source, vulnerableStatement);

  if (source.includes(helperSignature)) {
    if (vulnerableCount !== 0) {
      throw new Error(
        `Next.js ${nextVersion} ${bundleLabel} bundle contains both patched and vulnerable metadata-resume code. Refusing a partial patch.`,
      );
    }

    return { status: "already-patched", source };
  }

  if (vulnerableCount !== 3) {
    throw new Error(
      `Expected three vulnerable metadata-resume statements in Next.js ${nextVersion} ${bundleLabel} bundle, found ${vulnerableCount}. Review upstream PR #94630 before upgrading Next.js.`,
    );
  }

  if (!source.includes(insertionAnchor)) {
    throw new Error(
      `Could not find the safe helper insertion point in Next.js ${nextVersion} ${bundleLabel} bundle. Refusing to patch an unknown framework layout.`,
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
      `Next.js ${nextVersion} ${bundleLabel} PPR metadata-resume patch verification failed.`,
    );
  }

  return { status: "patched", source: patchedSource };
}

export async function patchNextAppRender({
  projectRoot = process.cwd(),
  logger = console,
} = {}) {
  const nextRoot = join(projectRoot, "node_modules", "next");
  const nextPackagePath = join(nextRoot, "package.json");
  const appRenderBundles = [
    {
      label: "CommonJS",
      path: join(nextRoot, "dist", "server", "app-render", "app-render.js"),
    },
    {
      label: "ESM",
      path: join(nextRoot, "dist", "esm", "server", "app-render", "app-render.js"),
    },
  ];

  const nextPackage = JSON.parse(await readFile(nextPackagePath, "utf8"));
  const preparedBundles = await Promise.all(
    appRenderBundles.map(async (bundle) => {
      const source = await readFile(bundle.path, "utf8");
      return {
        ...bundle,
        ...prepareAppRenderPatch({
          source,
          nextVersion: nextPackage.version,
          bundleLabel: bundle.label,
        }),
      };
    }),
  );

  const bundlesToPatch = preparedBundles.filter(
    (bundle) => bundle.status === "patched",
  );

  await Promise.all(
    bundlesToPatch.map((bundle) => writeFile(bundle.path, bundle.source, "utf8")),
  );

  if (bundlesToPatch.length === 0) {
    logger?.log(
      `[postinstall] Next.js ${nextPackage.version} already contains the PPR metadata-resume patch in both runtime bundles.`,
    );
    return "already-patched";
  }

  logger?.log(
    `[postinstall] Applied the upstream PPR metadata-resume fix to Next.js ${nextPackage.version} ${bundlesToPatch.map((bundle) => bundle.label).join(" and ")} runtime bundles (PR #94630).`,
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

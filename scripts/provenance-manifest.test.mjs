import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { assessArtifactDrift, validateProvenanceManifest } from "../lib/trust/provenance.mjs";

const manifest = JSON.parse(
  await readFile(new URL("../data/provenance/sharp-edges.json", import.meta.url), "utf8"),
);

const capturedArtifact = {
  repository: manifest.source.repository,
  commitSha: manifest.artifact.commitSha,
  path: manifest.artifact.path,
  checksumAlgorithm: manifest.artifact.checksum.algorithm,
  checksumValue: manifest.artifact.checksum.value,
};

test("captured provenance manifest is complete enough to reproduce artifact identity", () => {
  assert.deepEqual(validateProvenanceManifest(manifest), { valid: true, missing: [] });
  assert.match(manifest.artifact.commitSha, /^[0-9a-f]{40}$/);
  assert.match(manifest.artifact.checksum.value, /^[0-9a-f]{40}$/);
  assert.equal(manifest.artifact.checksum.algorithm, "git-blob-sha1");
  assert.equal(manifest.evaluation.scanners.length, 0);
  assert.match(manifest.trust.conclusion, /no fresh security verdict/i);
});

test("exact immutable artifact remains unchanged", () => {
  assert.deepEqual(assessArtifactDrift(manifest, capturedArtifact), {
    state: "unchanged",
    reason: "artifact-match",
    mismatches: [],
  });
});

test("changed commit invalidates the prior trust state", () => {
  const result = assessArtifactDrift(manifest, {
    ...capturedArtifact,
    commitSha: "0000000000000000000000000000000000000000",
  });

  assert.equal(result.state, "changed");
  assert.deepEqual(result.mismatches, ["commitSha"]);
});

test("changed content checksum invalidates the prior trust state", () => {
  const result = assessArtifactDrift(manifest, {
    ...capturedArtifact,
    checksumValue: "1111111111111111111111111111111111111111",
  });

  assert.equal(result.state, "changed");
  assert.deepEqual(result.mismatches, ["checksumValue"]);
});

test("missing current evidence produces unknown rather than a false unchanged state", () => {
  const { checksumValue: _checksumValue, ...incompleteArtifact } = capturedArtifact;
  const result = assessArtifactDrift(manifest, incompleteArtifact);

  assert.equal(result.state, "unknown");
  assert.equal(result.reason, "incomplete-current-artifact");
  assert.deepEqual(result.missing, ["checksumValue"]);
});

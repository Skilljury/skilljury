const REQUIRED_STRING_PATHS = [
  ["skill", "slug"],
  ["source", "repository"],
  ["artifact", "commitSha"],
  ["artifact", "path"],
  ["artifact", "checksum", "algorithm"],
  ["artifact", "checksum", "value"],
  ["evaluation", "tool", "name"],
  ["evaluation", "tool", "version"],
];

function readPath(object, path) {
  return path.reduce((value, key) => value?.[key], object);
}

export function validateProvenanceManifest(manifest) {
  const missing = REQUIRED_STRING_PATHS.filter((path) => {
    const value = readPath(manifest, path);
    return typeof value !== "string" || value.trim().length === 0;
  }).map((path) => path.join("."));

  return {
    valid: missing.length === 0,
    missing,
  };
}

export function assessArtifactDrift(manifest, currentArtifact) {
  const validation = validateProvenanceManifest(manifest);
  if (!validation.valid) {
    return { state: "unknown", reason: "invalid-manifest", missing: validation.missing };
  }

  const requiredCurrentFields = ["repository", "commitSha", "path", "checksumAlgorithm", "checksumValue"];
  const missingCurrent = requiredCurrentFields.filter((field) => {
    const value = currentArtifact?.[field];
    return typeof value !== "string" || value.trim().length === 0;
  });

  if (missingCurrent.length > 0) {
    return { state: "unknown", reason: "incomplete-current-artifact", missing: missingCurrent };
  }

  const expected = {
    repository: manifest.source.repository,
    commitSha: manifest.artifact.commitSha,
    path: manifest.artifact.path,
    checksumAlgorithm: manifest.artifact.checksum.algorithm,
    checksumValue: manifest.artifact.checksum.value,
  };

  const mismatches = requiredCurrentFields.filter((field) => expected[field] !== currentArtifact[field]);

  if (mismatches.length > 0) {
    return { state: "changed", reason: "artifact-mismatch", mismatches };
  }

  return { state: "unchanged", reason: "artifact-match", mismatches: [] };
}

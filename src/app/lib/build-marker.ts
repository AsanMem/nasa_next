const BUILD_TIME = new Date().toISOString();

export function getBuildMarker() {
  const commit =
    process.env.GITHUB_SHA ??
    process.env.NEXT_PUBLIC_GIT_COMMIT_SHA ??
    process.env.NEXT_PUBLIC_COMMIT_SHA ??
    "local";

  return {
    buildTime: BUILD_TIME,
    commit: commit.slice(0, 12),
    generatedAt: new Date().toISOString(),
  };
}

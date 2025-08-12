#!/usr/bin/env -S node --experimental-strip-types
// Usage: tsx create-release.ts minor|patch|major
import { $ } from "zx";
import semver from "semver";

async function main() {
  const bumpType = process.argv[2];
  if (!["major", "minor", "patch"].includes(bumpType)) {
    console.error("Usage: ./create-release major|minor|patch");
    process.exit(1);
  }

  // Get all releases (including prereleases)
  const allReleasesRaw = await $`gh release list --limit 100`;
  const allReleases = allReleasesRaw.stdout
    .trim()
    .split("\n")
    .map((line) => line.split(/\s+/)[0]);
  const latestRelease = allReleases[0];

  // Increment version
  const newVersion = semver.inc(latestRelease.replace(/^v/, ""), bumpType);
  if (!newVersion) {
    console.error("Could not increment version");
    process.exit(1);
  }

  // Get latest non-prerelease release
  const nonPreReleases = allReleases.filter((r) => !r.includes("-")); // crude filter
  const latestNonPre = nonPreReleases[0];

  // Get commit SHAs for latest non-prerelease and HEAD
  const fromTag = latestNonPre;
  const toRef = "HEAD";

  // Get all merge commits
  const mergeCommitsRaw =
    await $`git log ${fromTag}..${toRef} --merges --pretty=format:%H`;
  const mergeCommits = mergeCommitsRaw.stdout
    .trim()
    .split("\n")
    .filter(Boolean);

  // Get all commits
  const allCommitsRaw =
    await $`git log ${fromTag}..${toRef} --pretty=format:%H`;
  const allCommits = allCommitsRaw.stdout.trim().split("\n").filter(Boolean);

  // Get all commits that are not merge commits
  const nonMergeCommits = allCommits.filter(
    (sha) => !mergeCommits.includes(sha)
  );

  // Print commit messages
  console.log(`\nMerge commits since ${fromTag}:`);
  for (const sha of mergeCommits) {
    const msg = (await $`git log -1 --pretty=format:%s ${sha}`).stdout.trim();
    console.log(`- ${msg}`);
  }

  console.log(`\nNon-merge commits since ${fromTag}:`);
  for (const sha of nonMergeCommits) {
    const msg = (await $`git log -1 --pretty=format:%s ${sha}`).stdout.trim();
    console.log(`- ${msg}`);
  }

  // Print new version
  console.log(`\nNext release version: v${newVersion}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

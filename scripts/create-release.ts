#!/usr/bin/env -S node --experimental-strip-types
import { $ } from "zx";

// Ensure clean git status and no unpushed commits
await $`git fetch`;
const status = await $`git status --porcelain`;
if (status.stdout.trim() !== "") {
  console.error(
    "Error: Working tree is not clean. Please commit or stash your changes."
  );
  process.exit(1);
}
const branch = (await $`git rev-parse --abbrev-ref HEAD`).stdout.trim();
const localHash = (await $`git rev-parse ${branch}`).stdout.trim();
const remoteHash = (await $`git rev-parse origin/${branch}`).stdout.trim();
if (localHash !== remoteHash) {
  console.error(
    "Error: You have unpushed commits. Please push your changes before creating a release."
  );
  process.exit(1);
}

const bumpType = process.argv[2];
if (!["patch", "minor", "major"].includes(bumpType)) {
  console.error("Usage: ./create-release.ts patch|minor|major");
  process.exit(1);
}

// Run get-release-notes and capture output
const notes = await $`./get-release-notes.ts ${bumpType}`;

// Extract the next version from the notes output
const versionMatch = notes.stdout.match(
  /\*\*Next release version:\*\* v([\d\.]+)/
);

const version = versionMatch ? versionMatch[1] : null;
if (!version) {
  console.error(
    "Could not find next release version in get-release-notes output."
  );
  process.exit(1);
}

// Create the release using gh CLI, piping notes to --notes-file -
const rel = $`gh release create ${version} --notes-file -`;
rel.stdin.write(notes.stdout);
rel.stdin.end();
await rel;

console.log(`Release v${version} created.`);

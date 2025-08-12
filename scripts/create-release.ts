#!/usr/bin/env -S node --experimental-strip-types
import { $ } from "zx";

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
await $`gh release create ${version} --notes-file - <<< "${notes.stdout}"`;

console.log(`Release v${version} created.`);

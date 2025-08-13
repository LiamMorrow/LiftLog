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
const prereleaseFlag = process.argv.includes("--prerelease");
if (!["patch", "minor", "major"].includes(bumpType)) {
  console.error("Usage: ./create-release.ts patch|minor|major [--prerelease]");
  process.exit(1);
}

import { tmpdir } from "os";
import { join } from "path";
import { writeFileSync, readFileSync, unlinkSync } from "fs";

// Run get-release-notes and capture output
const notes = await $`./get-release-notes.ts ${bumpType} ${
  prereleaseFlag ? "--prerelease" : ""
}`;

// Extract the next version from the notes output
const versionMatch = notes.stdout.match(
  /\*\*Next release version:\*\* v([\d\.\w\-\.]+)/
);
const version = versionMatch ? versionMatch[1] : null;
if (!version) {
  console.error(
    "Could not find next release version in get-release-notes output."
  );
  process.exit(1);
}

// Write notes to a temp file
const tmpFile = join(tmpdir(), `liftlog-release-notes-${version}.md`);
writeFileSync(tmpFile, notes.stdout);

// Open in system editor
const editor = process.env.EDITOR || "vi";
await $`${editor} ${tmpFile}`;

// Read possibly edited notes
const editedNotes = readFileSync(tmpFile, "utf8");

// Create the release using gh CLI, passing notes file
await $`gh release create ${version} --title ${version} --notes-file ${tmpFile} ${
  prereleaseFlag ? "--prerelease" : ""
}`;

// Clean up temp file
try {
  unlinkSync(tmpFile);
} catch {}

// Get repo info to print release URL
const repoInfoRaw = await $`gh repo view --json name,owner`;
let repoInfo;
try {
  repoInfo = JSON.parse(repoInfoRaw.stdout);
} catch {
  repoInfo = { owner: "", name: "" };
}
const releaseUrl = `https://github.com/LiamMorrow/LiftLog/releases/tag/${version}`;

console.log(
  `Release v${version} created.${prereleaseFlag ? " (prerelease)" : ""}`
);
console.log(`View release: ${releaseUrl}`);

#!/usr/bin/env -S node --experimental-strip-types
import { $, question } from "zx";

// Ensure clean git status and no unpushed commits
await $`git fetch`;
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

console.log("Created temp file " + tmpFile + ". Opening..");

// Open in system editor
const editor = process.env.EDITOR || "vi";
await $({ stdio: "inherit" })`${editor} ${tmpFile}`;

const releaseAnswer = await question(
  `About to create release ${version}. Are you sure? [Y/n]`,
  {
    choices: ["y", "n", "Y", "N", ""],
  }
);
if (["n", "no"].includes(releaseAnswer.toLocaleLowerCase())) {
  process.exit(1);
}

// Create the release using gh CLI, passing notes file
if (prereleaseFlag) {
  await $`gh release create ${version} --title ${version} --notes-file ${tmpFile} --prerelease`;
} else {
  await $`gh release create ${version} --title ${version} --notes-file ${tmpFile}`;
}

// Clean up temp file
try {
  unlinkSync(tmpFile);
} catch {}

const releaseUrl = `https://github.com/LiamMorrow/LiftLog/releases/tag/${version}`;

console.log(
  `Release v${version} created.${prereleaseFlag ? " (prerelease)" : ""}`
);
console.log(`View release: ${releaseUrl}`);

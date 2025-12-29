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
import { OpenAI } from "openai";

function extractNotes(releaseBody: string): string | null {
  const startMarker = "# Release Summary";
  const endMarker = "## Merge commits since";

  const startIndex = releaseBody.indexOf(startMarker);
  if (startIndex === -1) {
    return null;
  }

  const endIndex = releaseBody.indexOf(endMarker);

  let notes: string;
  if (endIndex === -1) {
    notes = releaseBody.slice(startIndex + startMarker.length);
  } else {
    notes = releaseBody.slice(startIndex + startMarker.length, endIndex);
  }

  return notes.trim() || null;
}

async function generateStoreNotes(releaseNotes: string): Promise<string> {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = `Convert the following GitHub release notes into a concise "What's New" section for an app store (Google Play / Apple App Store).

Requirements:
- Keep it brief and scannable (max 500 characters)
- Use simple bullet points or short sentences
- Focus only on user-facing changes
- Avoid technical jargon
- Do not include version numbers or dates
- Do not use markdown formatting (no ** or # etc)

Release notes:
${releaseNotes}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5.2",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that writes concise, user-friendly app store release notes.",
        },
        { role: "user", content: prompt },
      ],
    });
    return completion.choices[0]?.message?.content?.trim() || releaseNotes;
  } catch (err) {
    console.error("Failed to generate store notes with OpenAI:", err);
    return releaseNotes;
  }
}

// Run get-release-notes and capture output
const notes = await $`./get-release-notes.ts ${bumpType} ${
  prereleaseFlag ? "--prerelease" : ""
}`;

// Extract the next version from the notes output
const versionMatch = notes.stdout.match(
  /\*\*Release version:\*\* v([\d\.\w\-\.]+)/
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

// Extract the release notes for store submission
const editedNotes = readFileSync(tmpFile, "utf-8");
const rawNotes = extractNotes(editedNotes) || "Bug fixes and improvements";

console.log("Generating app store release notes...");
const generatedStoreNotes = await generateStoreNotes(rawNotes);

// Write store notes to a temp file for editing
const storeNotesFile = join(tmpdir(), `liftlog-store-notes-${version}.txt`);
writeFileSync(storeNotesFile, generatedStoreNotes);

console.log("Opening store notes for editing...");
await $({ stdio: "inherit" })`${editor} ${storeNotesFile}`;

const storeNotes = readFileSync(storeNotesFile, "utf-8").trim();

const releaseAnswer = await question(
  `Create release ${version} and trigger publish workflows? [Y/n]`,
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

// Clean up temp files
try {
  unlinkSync(tmpFile);
  unlinkSync(storeNotesFile);
} catch {}

// Trigger the publish workflows
console.log("Triggering publish workflows...");

const workflows = [
  "android-publish.yml",
  "ios-publish.yml",
  "web-publish.yml",
];

for (const workflow of workflows) {
  try {
    await $`gh workflow run ${workflow} -f version_code=${version} -f release_notes=${storeNotes}`;
    console.log(`  ✓ Triggered ${workflow}`);
  } catch (err) {
    console.error(`  ✗ Failed to trigger ${workflow}:`, err);
  }
}

const releaseUrl = `https://github.com/LiamMorrow/LiftLog/releases/tag/${version}`;

console.log(
  `Release v${version} created.${prereleaseFlag ? " (prerelease)" : ""}`
);
console.log(`View release: ${releaseUrl}`);

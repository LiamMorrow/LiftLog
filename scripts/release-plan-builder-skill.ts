#!/usr/bin/env -S node --experimental-strip-types
/**
 * Publishes the plan-builder skill by moving the `plan-builder-skill` tag.
 */
import { $, question } from "zx";
import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

const SKILL_TAG = "plan-builder-skill";
const SKILL_PATH = "plugins/liftlog-plan-builder/skills/create-liftlog-plan";

$.verbose = false;
// Every path below is repo-relative, but the script is run from `scripts/`.
// A mismatched pathspec makes `git log` silently print nothing rather than fail.
$.cwd = (await $`git rev-parse --show-toplevel`).stdout.trim();

/** The format versions the skill at `ref` will tell Claude to write. */
async function formatVersionsAt(ref: string): Promise<string> {
  try {
    const raw = await $`git show ${`${ref}:${SKILL_PATH}/reference/ProgramBlueprint.json`}`;
    const schema = JSON.parse(raw.stdout);
    const session = Object.values<any>(schema.definitions ?? {}).find(
      (d) => d?.properties?.version?.const !== undefined,
    );
    return `plan v${schema.properties?.version?.const}, session v${session?.properties?.version?.const}`;
  } catch {
    return "unknown";
  }
}

await $`git fetch --tags --force`;

const requested =
  process.argv[2] ?? (await $`gh release view --json tagName -q .tagName`).stdout.trim();

let sha: string;
try {
  sha = (await $`git rev-parse ${`${requested}^{commit}`}`).stdout.trim();
} catch {
  console.error(`Error: '${requested}' is not a commit, tag or branch this checkout knows about.`);
  process.exit(1);
}

let currentSha: string | null = null;
try {
  currentSha = (await $`git rev-parse ${`${SKILL_TAG}^{commit}`}`).stdout.trim();
} catch {}

if (currentSha === sha) {
  console.log(`${SKILL_TAG} already points at ${requested} (${sha.slice(0, 9)}). Nothing to do.`);
  process.exit(0);
}

console.log(`Publishing the skill as of ${requested} (${sha.slice(0, 9)})\n`);
if (currentSha) {
  console.log(
    `  currently published: ${currentSha.slice(0, 9)}  ->  ${await formatVersionsAt(SKILL_TAG)}`,
  );
}
console.log(`  publishing:          ${sha.slice(0, 9)}  ->  ${await formatVersionsAt(sha)}\n`);

if (currentSha) {
  const changes =
    await $`git log --oneline ${`${currentSha}..${sha}`} -- ${SKILL_PATH} app/src/models/storage/versions/latest/blueprint.ts`;
  console.log(
    changes.stdout.trim() || "  (no skill or format changes since the published version)",
  );
  console.log();
}

// Built from the tagged commit rather than the working tree, so an unpushed or
// half-finished local change can never end up in what users install.
const workDir = mkdtempSync(join(tmpdir(), "liftlog-skill-"));
try {
  await $`git archive ${sha} ${SKILL_PATH} | tar -x -C ${workDir}`;
  const skillDir = join(workDir, SKILL_PATH);

  // The examples are what users copy from, so they have to survive the app's
  // own import path before this goes anywhere.
  const examples = (await $`ls ${join(skillDir, "examples")}`).stdout.trim().split("\n");
  for (const example of examples) {
    await $`node ${join(skillDir, "scripts/validate-plan.mjs")} ${join(skillDir, "examples", example)}`;
  }
  console.log(`Validated ${examples.length} example plans.\n`);

  const answer = await question(
    `Only publish once ${requested} is live in the stores - a plan this skill writes cannot be read by an older app. Move ${SKILL_TAG}? [y/N] `,
  );
  if (!["y", "yes"].includes(answer.trim().toLowerCase())) {
    console.log("Aborted.");
    process.exit(1);
  }

  await $`git tag -f ${SKILL_TAG} ${sha}`;
  await $`git push --force origin ${`refs/tags/${SKILL_TAG}`}`;
  console.log(`  ✓ Moved ${SKILL_TAG} to ${sha.slice(0, 9)} - /plugin install now serves it`);

  const skillsDir = join(workDir, "plugins/liftlog-plan-builder/skills");
  await $({ cwd: skillsDir })`zip -r create-liftlog-plan.zip create-liftlog-plan/`;
  await $`gh release upload ${SKILL_TAG} ${join(skillsDir, "create-liftlog-plan.zip")} --clobber`;
  console.log("  ✓ Uploaded create-liftlog-plan.zip - the claude.ai download now serves it");
} finally {
  rmSync(workDir, { recursive: true, force: true });
}

#!/usr/bin/env -S node --experimental-strip-types
// Usage: tsx create-release.ts minor|patch|major
import { $ } from "zx";
import semver, { type ReleaseType } from "semver";
import { OpenAI } from "openai";
async function commitsInMerge(mergeHash: string, mainline: number = 1) {
  // Get the parent commits
  const parentsRaw = await $`git rev-list --parents -n 1 ${mergeHash}`;
  const [commit, ...parents] = parentsRaw.stdout.trim().split(" ");
  if (parents.length < 2) return []; // not a merge commit

  const mainlineParent = parents[mainline - 1];
  const otherParents = parents.filter((p, i) => i !== mainline - 1);

  // Commits reachable from other parents but not mainline parent
  const commits: string[] = [];
  for (const parent of otherParents) {
    const { stdout } = await $`git rev-list ${parent} ^${mainlineParent}`;
    commits.push(...stdout.trim().split("\n").filter(Boolean));
  }

  return commits;
}
async function main() {
  const bumpType = process.argv[2] as ReleaseType;
  const prereleaseFlag = process.argv.includes("--prerelease");
  if (!["major", "minor", "patch"].includes(bumpType)) {
    console.error(
      "Usage: ./get-release-notes.ts major|minor|patch [--prerelease]"
    );
    process.exit(1);
  }

  // Get all releases (including prereleases)
  const allReleasesRaw = await $`gh release list --limit 100`;
  const allReleaseLines = allReleasesRaw.stdout.trim().split("\n");
  // Each line: tagName  Pre-release|Draft|Published  name  date
  const allReleases = allReleaseLines.map((line) => {
    const cols = line.split(/\s+/);
    return { tag: cols[0], status: cols[1], name: cols[2], date: cols[3] };
  });
  const latestRelease = allReleases[0]?.tag;

  // Increment version
  const newVersion = semver.inc(latestRelease?.replace(/^v/, ""), bumpType);
  if (!newVersion) {
    console.error("Could not increment version");
    process.exit(1);
  }
  // Print new version
  console.log(`**Release version:** v${newVersion}\n`);

  // Get latest non-prerelease release (status is not Pre-release)
  const nonPreReleases = allReleases.filter((r) => r.status !== "Pre-release");
  const latestNonPre = nonPreReleases[0]?.tag;

  // Get commit SHAs for latest non-prerelease and HEAD
  const fromTag = prereleaseFlag ? latestRelease : latestNonPre;
  const toRef = "HEAD";

  // Get all merge commits
  const mergeCommitsRaw =
    await $`git log ${fromTag}..${toRef} --merges --pretty=format:%H`;
  const mergeCommits = mergeCommitsRaw.stdout
    .trim()
    .split("\n")
    .filter(Boolean);

  // Get all commits in the range
  const allCommitsRaw =
    await $`git log ${fromTag}..${toRef} --pretty=format:%H`;
  const allCommits = allCommitsRaw.stdout.trim().split("\n").filter(Boolean);

  // Get all descendants of merge commits
  let mergeDescendants = new Set<string>();
  for (const mergeSha of mergeCommits) {
    const commitsPartOfThisMerge = await commitsInMerge(mergeSha);
    commitsPartOfThisMerge.forEach((x) => mergeDescendants.add(x));
  }

  // Non-merge commits that are NOT descendants of any merge commit
  const nonMergeCommits = allCommits.filter(
    (sha) => !mergeCommits.includes(sha) && !mergeDescendants.has(sha)
  );

  // Collect all commit messages for summary
  let allMessages: string[] = [];
  for (const sha of mergeCommits) {
    const msg = (await $`git log -1 --pretty=format:%s ${sha}`).stdout.trim();
    allMessages.push(msg);
  }
  for (const sha of nonMergeCommits) {
    const msg = (await $`git log -1 --pretty=format:%s ${sha}`).stdout.trim();
    allMessages.push(msg);
  }

  // Generate summary using OpenAI
  let summary = "";
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = `Summarize the following release notes for a GitHub release. Focus on user-facing changes and improvements. AVOID listing reasons for changes unless you are explicitly quoting a commit message. NEVER say stuff like "ensuring a smoother user experience." or "improving efficiency." or things like that. The change is the change, the reasons are either implicit from the commit, or you DEFINITELY DO NOT need to infer them to say what they improve."\n\n${allMessages.join(
      "\n"
    )}`;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that writes concise, release note summaries.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 300,
    });
    summary = completion.choices[0]?.message?.content?.trim() || "";
  } catch (err) {
    summary = "(Could not generate summary)";
  }

  // Print summary at the top
  console.log(`# Release Summary\n\n${summary}\n`);

  // Print commit messages as GitHub markdown with collapsibles
  console.log(`\n## Merge commits since ${fromTag}`);
  for (const sha of mergeCommits) {
    const msg = (await $`git log -1 --pretty=format:%s ${sha}`).stdout.trim();
    const body = (await $`git log -1 --pretty=format:%b ${sha}`).stdout.trim();
    const shortSha = (await $`git rev-parse --short ${sha}`).stdout.trim();
    console.log(`- ${msg} (${shortSha})`);
  }

  console.log(`\n## Non-merge commits since ${fromTag}`);
  for (const sha of nonMergeCommits) {
    const msg = (await $`git log -1 --pretty=format:%s ${sha}`).stdout.trim();
    const body = (await $`git log -1 --pretty=format:%b ${sha}`).stdout.trim();
    const shortSha = (await $`git rev-parse --short ${sha}`).stdout.trim();
    console.log(`- ${msg} (${shortSha})`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

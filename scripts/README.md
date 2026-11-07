# scripts

To install dependencies:

```bash
npm install
```

This directory contains general scripts which LiftLog uses. Each script is an executable zx
script run directly under Node - the shebang handles TypeScript, so there is no build step.

## Collecting Screenshots For App Store

The collect screenshots script will start android and ios simulators and collect screenshots of various parts of the app. The screenshots can be used on the respective app stores.

Run:

```bash
./collect-screenshots.ts
```

## Releasing the plan builder skill

The plan-builder skill writes plans against the format on `main`, but plan files only
migrate forward - a plan written in a newer format cannot be opened by an older app. In
order for users' apps to open what the skill writes, the skill users install is pinned to
the `plan-builder-skill` tag rather than to `main`. `release-plan-builder-skill.ts` moves
the tag.

Run `release-plan-builder-skill.ts` **after a release is actually live in the stores**,
not when `create-release.ts` uploads the release - the store lead time is the point of
the gate:

```bash
./release-plan-builder-skill.ts 4.22.0
```

With no argument the script targets the latest GitHub release. The script prints the format versions
being published, validates the example plans, then moves the tag and re-uploads the
claude.ai zip. Moving the tag needs admin, because the Release Blocking ruleset covers
all tags.

# scripts

To install dependencies:

```bash
npm install
```

This directory contains general scripts which LiftLog uses. Each is an executable zx
script run directly under Node - the shebang handles TypeScript, so there is no build step.

## Collecting Screenshots For App Store

The collect screenshots script will start android and ios simulators and collect screenshots of various parts of the app. These can be used on the respective app stores.

Run:

```bash
./collect-screenshots.ts
```

## Releasing the plan builder skill

The plan-builder skill writes plans against the format on `main`, but plan files only
migrate forward - a plan written in a newer format cannot be opened by an older app. So
the skill users install is pinned to the `plan-builder-skill` tag rather than to `main`,
and this script is what moves it.

Run it **after a release is actually live in the stores**, not when `create-release.ts`
uploads it - the store lead time is the point of the gate:

```bash
./release-plan-builder-skill.ts 4.22.0
```

With no argument it targets the latest GitHub release. It prints the format versions
being published, validates the example plans, then moves the tag and re-uploads the
claude.ai zip. Moving the tag needs admin, because the Release Blocking ruleset covers
all tags.

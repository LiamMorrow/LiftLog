# LiftLog Plan Builder

A Claude skill that builds [LiftLog](https://liftlog.online) workout plans. Describe the training you want — "a 4-day upper/lower split for an intermediate lifter, dumbbells only" — and it writes a `.liftlogplan` file you can import into the app.

The plan is validated against LiftLog's own schema before you get it, so it will import cleanly.

## Install

### Claude Code

```
/plugin marketplace add LiamMorrow/LiftLog
/plugin install liftlog-plan-builder@liftlog
```

### Claude chat (claude.ai)

Download [`create-liftlog-plan.zip`](https://github.com/LiamMorrow/LiftLog/releases/download/plan-builder-skill/create-liftlog-plan.zip), then go to **Customize → Skills → + → Upload a skill** and pick it.

The zip is rebuilt by CI on every change to this folder, so it always matches `main`.

## Use

Just ask:

> Build me a 5x5 strength program for three days a week.

> Convert this spreadsheet into a LiftLog plan.

> Take my push-pull-legs plan and swap the barbell work for dumbbells.

When it's done, get the file onto your phone (AirDrop, email, or Files) and tap it — LiftLog will open it. Or open LiftLog and go to **Plans → Import**.

## What's in here

| Path | |
| --- | --- |
| `skills/create-liftlog-plan/SKILL.md` | The skill itself. |
| `skills/create-liftlog-plan/reference/format.md` | Field-by-field guide to the format. |
| `skills/create-liftlog-plan/reference/ProgramBlueprint.json` | The JSON Schema. Generated — see below. |
| `skills/create-liftlog-plan/scripts/validate-plan.mjs` | Validator. No dependencies, no network. Generated — see below. |
| `skills/create-liftlog-plan/examples/` | A weighted plan and a cardio plan. |

`ProgramBlueprint.json` and `validate-plan.mjs` are **generated** from the app's TypeScript models by `cd app && npm run json-schema`. Don't edit them by hand; change `app/src/models/storage/versions/latest/blueprint.ts` and regenerate.

For the format itself, see [docs/PlanFileFormat.md](../../docs/PlanFileFormat.md).

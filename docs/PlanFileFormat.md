# Plan Files

LiftLog plans can be exported to, and imported from, `.liftlogplan` files. A plan file is plain JSON, so you can write one yourself, share one with a friend, keep one in version control — or have an AI write one for you.

To import a plan, either tap a `.liftlogplan` file on your device (LiftLog is registered to open them), or open the app and go to `Plans -> Import`. To export one, use the `⋮` menu next to any plan.

The authoritative definition of the format is the JSON Schema at [`docs/schemas/program-blueprint/ProgramBlueprint.json`](./schemas/program-blueprint/ProgramBlueprint.json). It is generated from the app's own models, so it is always in step with what the app will accept.

## Generating a plan with Claude

This repository ships a Claude skill that writes plan files for you. Describe the training you want — "a 4-day upper/lower split for an intermediate lifter, dumbbells only" — and it produces a `.liftlogplan` file, validated against the schema above before you ever see it.

### Claude Code

```
/plugin marketplace add LiamMorrow/LiftLog
/plugin install liftlog-plan-builder@liftlog
```

### Claude chat (claude.ai)

Download [`create-liftlog-plan.zip`](https://github.com/LiamMorrow/LiftLog/releases/download/plan-builder-skill/create-liftlog-plan.zip), then in Claude go to `Customize -> Skills -> + -> Upload a skill` and select it.

That zip is rebuilt from this repository on every change, so it is always the current skill.

Once it is installed, just ask for what you want:

> Build me a 5x5 strength program, three days a week.

Get the resulting file onto your phone (AirDrop, email, or save it to Files) and tap it.

## Generating a plan with another AI

Nothing about the format is Claude-specific. To use ChatGPT, Gemini, or anything else, give it the schema and the rules below:

> Write me a LiftLog workout plan as a single JSON object matching the schema at
> https://github.com/LiamMorrow/LiftLog/blob/main/docs/schemas/program-blueprint/ProgramBlueprint.json
>
> Rules that are easy to get wrong:
>
> - Every field in the schema is required. There are no optional fields. Empty strings for `notes` and `link`.
> - `"version": 2` on the root object and on every session.
> - Weights and distances are decimal **strings**: `"2.5"`, not `2.5`.
> - Rests and cardio times are ISO-8601 durations: `"PT3M"`, `"PT90S"`.
> - `sets` is a whole number on a weighted exercise, but an array of set objects on a cardio exercise.
> - Supersets are a flag on the preceding exercise: `"supersetWithNext": true`.
> - `type` values are case-sensitive. Exercises and progressive overloads are PascalCase (`"WeightedExerciseBlueprint"`); cardio targets are lowercase (`"time"`, `"distance"`).
>
> [describe the training you want here]

Save the result as `My Plan.liftlogplan`.

## The format

A plan file is one JSON object: a name, a date, and a list of sessions. Each session is a training day holding a list of exercises.

```json
{
  "version": 2,
  "name": "Push Pull Legs",
  "lastEdited": "2026-07-12",
  "sessions": [
    {
      "version": 2,
      "name": "Push",
      "notes": "Chest, shoulders and triceps.",
      "exercises": [
        {
          "type": "WeightedExerciseBlueprint",
          "name": "Barbell Bench Press",
          "sets": 3,
          "repsPerSet": 5,
          "restBetweenSets": { "minRest": "PT3M", "maxRest": "PT5M", "failureRest": "PT5M" },
          "supersetWithNext": false,
          "notes": "",
          "link": "",
          "progressiveOverload": { "type": "IncreaseAllEvenlyProgressiveOverload", "amount": "2.5" }
        }
      ]
    }
  ]
}
```

Complete examples live in [`plugins/liftlog-plan-builder/skills/create-liftlog-plan/examples/`](../plugins/liftlog-plan-builder/skills/create-liftlog-plan/examples) — one weighted plan and one cardio plan.

### Exercises

An exercise is either a `WeightedExerciseBlueprint` or a `CardioExerciseBlueprint`, chosen by its `type`. The two can be mixed within a session.

**Weighted exercises** have a set count, a rep target, rest times, and a progressive overload rule. `restBetweenSets` needs all three of `minRest`, `maxRest`, and `failureRest` (the last being the rest taken after missing a rep target). `link` is a URL explaining the movement, and should stay `""` unless you have a real one.

`supersetWithNext` is how supersets are expressed: there is no superset group. Setting it to `true` means "perform this back-to-back with the next exercise in the list, without resting".

**Cardio exercises** have no rest and no progressive overload. Their `sets` is an array — one entry per interval — and each entry has a `target` (either a time or a distance) plus six `track*` booleans controlling which fields the app shows you while logging.

### Progressive overload

Each weighted exercise carries one of three rules:

| `type`                                 | Effect                                                                                                                                                                |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NoProgressiveOverload`                | Weight never increases automatically. Suits bodyweight work.                                                                                                          |
| `IncreaseAllEvenlyProgressiveOverload` | After a successful session, every set goes up by `amount`. The usual choice — 2.5 kg or 5 lb.                                                                         |
| `IncreaseLowestSetProgressiveOverload` | Raises only the lowest-weight sets, chosen by `increaseStrategy` (`first`, `middle`, `last`, or `all`). For lifts where a full jump is too much, like lateral raises. |

`amount` is a decimal string, in whatever unit the app is set to.

## Validating a plan

The skill ships a validator, and you can run it directly on any file. It needs no dependencies and no network:

```bash
node plugins/liftlog-plan-builder/skills/create-liftlog-plan/scripts/validate-plan.mjs "My Plan.liftlogplan"
```

It lists every problem at once, with the path to the offending field:

```
My Plan.liftlogplan is not a valid LiftLog plan:

  plan/sessions/0/exercises/0/restBetweenSets/minRest must match format "duration"
  plan/sessions/1/exercises/0/progressiveOverload/amount must be string
```

This is worth doing, because the app itself will only tell you _"That file isn't a valid workout plan"_ — it cannot tell you which field is wrong.

## Regenerating the schema

Both the schema and the validator are generated from `app/src/models/storage/versions/latest/blueprint.ts`. After changing that model:

```bash
cd app && npm run json-schema
```

This rewrites the published schema, the copy bundled into the app, the copy inside the skill, and the skill's validator. See [Storage Migrations](./Migrations.md) for the full process of changing a stored model.

# Plan Files

LiftLog plans can be exported to, and imported from, `.liftlogplan` files. A plan file is plain JSON, so you can write one yourself, share one with a friend, keep one in version control - or have an AI write one for you.

To import a plan, either tap a `.liftlogplan` file on your device (LiftLog is registered to open them), or open the app and go to `Plans -> Import`.

To export one, open `Plans`, tap the `⋮` next to the plan and choose `Export to file`. LiftLog writes the `.liftlogplan` and hands it to the system share sheet, so you can save it to Files or Drive, AirDrop it, or mail it to yourself - whatever gets it somewhere you can reach it again.

The authoritative definition of the format is the JSON Schema at [`docs/schemas/program-blueprint/ProgramBlueprint.json`](./schemas/program-blueprint/ProgramBlueprint.json). It is generated from the app's own models, so it is always in step with what the app will accept.

## Generating a plan with Claude

This repository ships a Claude skill that writes plan files for you. Describe the training you want - "a 4-day upper/lower split for an intermediate lifter, dumbbells only" - and it produces a `.liftlogplan` file, validated against the schema above before you ever see it.

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

### Changing a plan you already run

The skill reads plans as happily as it writes them, so you can send it the one you are training on rather than describing it. Export the plan from `Plans -> ⋮ -> Export to file`, save it somewhere you can get at it from your computer (Drive, or mail it to yourself), then give the `.liftlogplan` to Claude and say what you want changed:

> Here's my current plan. Swap all the barbell work for dumbbells, and add a fourth day.

> This plan is taking too long. Cut it to 45 minutes without losing the compounds.

> Have a look at my plan and tell me what's missing.

Exporting means Claude sees your real exercise names, rest times, and progressive overload settings, so what comes back is your plan with the change made - not an approximation of it rebuilt from a description.

Importing the result **adds a new plan**; it does not overwrite the original. Delete the old one from `Plans` once the replacement is in. Your logged workout history is kept separately and is untouched by either.

## Generating a plan with another AI

Nothing about the format is Claude-specific. To use ChatGPT, Gemini, or anything else, give it the schema and the rules below:

> Write me a LiftLog workout plan as a single JSON object matching the schema at
> https://github.com/LiamMorrow/LiftLog/blob/main/docs/schemas/program-blueprint/ProgramBlueprint.json
>
> Rules that are easy to get wrong:
>
> - Treat every field in the schema as required, apart from the handful marked optional. Empty strings for `notes` and `link`.
> - `"version": 3` on the root object, `"version": 6` on every session.
> - Weights, distances and progression steps are decimal **strings**: `"2.5"`, not `2.5`. Rep counts are plain integers.
> - Rests and cardio times are ISO-8601 durations: `"PT3M"`, `"PT90S"`.
> - A weighted exercise has no set count: one entry in `plannedSets` is one set. Cardio uses `sets`, an array of set objects.
> - Supersets are a flag on the preceding exercise: `"supersetWithNext": true`.
> - `type` values are case-sensitive. Exercise types are PascalCase (`"WeightedExerciseBlueprint"`); cardio targets, progression scopes and resistance are lowercase or camelCase (`"time"`, `"allSets"`, `"bodyweight"`).
>
> [describe the training you want here]

Save the result as `My Plan.liftlogplan`.

## The format

A plan file is one JSON object: a name, a date, and a list of sessions. Each session is a training day holding a list of exercises.

```json
{
  "version": 3,
  "name": "Push Pull Legs",
  "lastEdited": "2026-07-12",
  "sessions": [
    {
      "version": 6,
      "name": "Push",
      "notes": "Chest, shoulders and triceps.",
      "exercises": [
        {
          "type": "WeightedExerciseBlueprint",
          "name": "Barbell Bench Press",
          "plannedSets": [
            { "reps": { "min": 5, "max": 5 } },
            { "reps": { "min": 5, "max": 5 } },
            { "reps": { "min": 5, "max": 5 } }
          ],
          "restBetweenSets": { "minRest": "PT3M", "maxRest": "PT5M", "failureRest": "PT5M" },
          "supersetWithNext": false,
          "notes": "",
          "link": "",
          "resistance": "external",
          "progression": [
            {
              "axis": "load",
              "step": "2.5",
              "scope": { "type": "allSets" },
              "trigger": "allSetsMetTarget"
            }
          ]
        }
      ]
    }
  ]
}
```

Complete examples live in [`plugins/liftlog-plan-builder/skills/create-liftlog-plan/examples/`](../plugins/liftlog-plan-builder/skills/create-liftlog-plan/examples) - one weighted plan and one cardio plan.

### Exercises

An exercise is either a `WeightedExerciseBlueprint` or a `CardioExerciseBlueprint`, chosen by its `type`. The two can be mixed within a session.

**Weighted exercises** have a list of planned sets, rest times, a resistance, and a list of progression rules. `plannedSets` holds one entry per set, each with that set's rep target as a `min`/`max` band - `min === max` is a plain "five reps". `restBetweenSets` needs all three of `minRest`, `maxRest`, and `failureRest` (the last being the rest taken after missing a rep target). `link` is a URL explaining the movement, and should stay `""` unless you have a real one.

`resistance` says where the load comes from: `external` for barbells, dumbbells and machines (the logged weight is the weight lifted), `bodyweight` for pull ups and dips (the logged weight is what is added on top of the lifter), or `none` for movements like crunches, where there is no weight at all and reps are the whole story.

`supersetWithNext` is how supersets are expressed: there is no superset group. Setting it to `true` means "perform this back-to-back with the next exercise in the list, without resting".

**Cardio exercises** have no resistance and no progression. Their `sets` is an array - one entry per interval - and each entry has a `target` (either a time or a distance) plus six `track*` booleans controlling which fields the app shows you while logging, and optionally its own `restBetweenSets`.

### Progression

`progression` is an ordered list of rules. After a session where every set met its target, the first rule that still has room to move is applied - and only that one. An empty list means the exercise never moves on its own.

| Field       | Effect                                                                                                                             |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `axis`      | What the rule moves: `load` or `reps`.                                                                                             |
| `step`      | How much to add, as a decimal string. Unitless - `"2.5"` is the same pair of small plates in a kilo gym and a pound gym.            |
| `scope`     | `{ "type": "allSets" }`, or `{ "type": "lowestSets", "pick": … }` with `first`, `middle`, `last` or `all` to raise only the lowest. |
| `trigger`   | Always `allSetsMetTarget`.                                                                                                         |
| `ceiling`   | Optional, reps only. Where the rule stops, handing over to the next one.                                                            |
| `onCeiling` | Optional, reps only. `reset` drops the reps back to the plan's when a later rule takes over.                                        |

Only a reps rule takes a ceiling, so a load rule never runs out of room and must come last - anything after it can never fire. Reps to a ceiling followed by weight is double progression: the reps climb, then the weight goes up and the reps start again.

See [Progression](./Progression.md) for how the rules behave in the app.

## Validating a plan

The skill ships a validator, and you can run it directly on any file. It needs no dependencies and no network:

```bash
node plugins/liftlog-plan-builder/skills/create-liftlog-plan/scripts/validate-plan.mjs "My Plan.liftlogplan"
```

It lists every problem at once, with the path to the offending field:

```
My Plan.liftlogplan is not a valid LiftLog plan:

  plan/sessions/0/exercises/0/restBetweenSets/minRest must match format "duration"
  plan/sessions/1/exercises/0/progression/0/step must be string
```

This is worth doing, because the app itself will only tell you _"That file isn't a valid workout plan"_ - it cannot tell you which field is wrong.

## Regenerating the schema

Both the schema and the validator are generated from `app/src/models/storage/versions/latest/blueprint.ts`. After changing that model:

```bash
cd app && npm run json-schema
```

This rewrites the published schema, the copy bundled into the app, the copy inside the skill, and the skill's validator. See [Storage Migrations](./Migrations.md) for the full process of changing a stored model.

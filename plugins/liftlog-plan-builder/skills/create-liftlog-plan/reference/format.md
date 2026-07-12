# The `.liftlogplan` format

A `.liftlogplan` file is a single JSON object. `ProgramBlueprint.json` in this directory is the authoritative JSON Schema; this page explains it.

## Rules that catch everyone

Read these first. They are the reason most generated plans fail to import.

1. **Every field is required.** There are no optional fields anywhere in this format. `notes` and `link` must be present even when empty — use `""`.
2. **`"version": 2`** goes on the root object *and* on every session. It is not the plan's own version number; it is the format's.
3. **Weights and distances are strings, not numbers.** `"amount": "2.5"`, never `"amount": 2.5`.
4. **Rests and times are ISO-8601 durations.** `"PT3M"` is three minutes, `"PT90S"` is ninety seconds, `"PT1M30S"` also works. A bare `"90"` or `90` is invalid.
5. **`sets` means two different things.** On a weighted exercise it is a whole number (`"sets": 3`). On a cardio exercise it is an *array* of set objects.
6. **`type` values are case-sensitive**, and the casing is not consistent across the format. Exercises and progressive overloads use PascalCase (`"WeightedExerciseBlueprint"`); cardio targets use lowercase (`"time"`, `"distance"`). Copy them exactly as written below.

## Root

```json
{
  "version": 2,
  "name": "Push Pull Legs",
  "lastEdited": "2026-07-12",
  "sessions": [ ... ]
}
```

| Field | Type | Notes |
| --- | --- | --- |
| `version` | number | Always `2`. |
| `name` | string | The plan name, as it appears in the app. |
| `lastEdited` | string | Date as `YYYY-MM-DD`. Use today's date. |
| `sessions` | array | One per training day. |

## Session

```json
{
  "version": 2,
  "name": "Push",
  "notes": "Chest, shoulders and triceps.",
  "exercises": [ ... ]
}
```

| Field | Type | Notes |
| --- | --- | --- |
| `version` | number | Always `2`. Yes, here too. |
| `name` | string | e.g. `"Push"`, `"Upper A"`, `"Leg Day"`. |
| `notes` | string | `""` if there's nothing to say. |
| `exercises` | array | Weighted and cardio exercises can be mixed freely. |

## Weighted exercise

```json
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
```

| Field | Type | Notes |
| --- | --- | --- |
| `type` | string | Exactly `"WeightedExerciseBlueprint"`. |
| `name` | string | The exercise name. |
| `sets` | integer | Number of sets. |
| `repsPerSet` | integer | Target reps in each set. |
| `restBetweenSets` | object | See below. |
| `supersetWithNext` | boolean | See supersets below. |
| `notes` | string | Cues or instructions. `""` if none. |
| `link` | string | A URL explaining the movement. **Leave as `""` unless the user gave you a specific link** — do not invent or guess URLs. |
| `progressiveOverload` | object | See below. |

### Rest

All three are required ISO-8601 durations.

| Field | Meaning |
| --- | --- |
| `minRest` | The shortest acceptable rest. |
| `maxRest` | The longest. |
| `failureRest` | Rest after a set where they missed the target reps — normally the longest of the three. |

Pick rests from the effort of the lift: heavy compounds 3–5 minutes, accessories 60–90 seconds.

### Supersets

There is no superset group. `"supersetWithNext": true` means "do this exercise back to back with the **next one in the array**, with no rest between them". To superset A with B, set it on A and leave it `false` on B. For a three-exercise circuit, set it `true` on the first two.

### Progressive overload

One of three shapes. Pick per exercise.

```json
{ "type": "NoProgressiveOverload" }
```
The weight never goes up automatically. Use for bodyweight work, or when the user doesn't want it.

```json
{ "type": "IncreaseAllEvenlyProgressiveOverload", "amount": "2.5" }
```
The normal one: after a successful session, every set goes up by `amount`. Use `"2.5"` kg or `"5"` lb for most lifts; `"5"` kg / `"10"` lb is reasonable for squats and deadlifts.

```json
{ "type": "IncreaseLowestSetProgressiveOverload", "amount": "1.25", "increaseStrategy": "middle" }
```
Only raises *some* sets — for lifts where adding weight across the board is too big a jump (lateral raises, most shoulder and arm isolation work). `increaseStrategy` must be one of `"first"`, `"middle"`, `"last"`, `"all"` — which of the lowest-weight sets to bump.

## Cardio exercise

```json
{
  "type": "CardioExerciseBlueprint",
  "name": "Steady Run",
  "notes": "",
  "link": "",
  "sets": [
    {
      "target": { "type": "distance", "value": { "value": "5", "unit": "kilometre" } },
      "trackDuration": true,
      "trackDistance": true,
      "trackResistance": false,
      "trackIncline": false,
      "trackWeight": false,
      "trackSteps": false
    }
  ]
}
```

`sets` is an **array** here — one object per interval or round. There is no rest or progressive overload on cardio.

Every set needs a `target` plus all six `track*` booleans, which control the fields the app shows while logging. Turn on the ones that make sense for the movement (a bike: duration + resistance; a treadmill run: duration, distance, incline) and leave the rest `false`.

A target is one of:

```json
{ "type": "time", "value": "PT20M" }
{ "type": "distance", "value": { "value": "5", "unit": "kilometre" } }
```

Note the lowercase `type`. `unit` must be one of `"metre"`, `"yard"`, `"mile"`, `"kilometre"`, and `value.value` is a decimal **string**.

## Validate before you hand it over

```bash
node scripts/validate-plan.mjs "My Plan.liftlogplan"
```

No install, no network. It lists every problem with the path to the field, e.g.:

```
  plan/sessions/0/exercises/0/restBetweenSets/minRest must match format "duration"
  plan/sessions/1/exercises/0/progressiveOverload/amount must be string
```

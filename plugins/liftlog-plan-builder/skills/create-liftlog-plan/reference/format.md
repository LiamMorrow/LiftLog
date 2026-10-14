# The `.liftlogplan` format

A `.liftlogplan` file is a single JSON object. `ProgramBlueprint.json` in this directory is the authoritative JSON Schema; this page explains it.

## Rules that catch everyone

Read these first. They are the reason most generated plans fail to import.

1. **Assume every field is required.** Only three are optional - `ceiling` and `onCeiling` on a progression rule, and `restBetweenSets` on a cardio set. Everything else must be present, including `notes` and `link` when empty - use `""`.
2. **`"version": 3`** goes on the root object, and **`"version": 6`** on every session. These are not the plan's own version number; they are the format's, and they differ from each other.
3. **Weights and steps are strings, not numbers.** `"step": "2.5"`, never `"step": 2.5`. Rep counts (`min`, `max`) are the exception: those are plain integers.
4. **Rests and times are ISO-8601 durations.** `"PT3M"` is three minutes, `"PT90S"` is ninety seconds, `"PT1M30S"` also works. A bare `"90"` or `90` is invalid.
5. **A weighted exercise has no set count.** One entry in `plannedSets` _is_ one set, so three sets of five means three identical entries. Cardio exercises use `sets`, an array, one entry per interval.
6. **`type` values are case-sensitive**, and the casing is not consistent across the format. Exercise types use PascalCase (`"WeightedExerciseBlueprint"`); everything else - cardio targets, progression scopes, resistance - is lowercase or camelCase (`"time"`, `"allSets"`, `"bodyweight"`, `"allSetsMetTarget"`). Copy them exactly as written below.

## Root

```json
{
  "version": 3,
  "name": "Push Pull Legs",
  "lastEdited": "2026-07-12",
  "sessions": [ ... ]
}
```

| Field        | Type   | Notes                                    |
| ------------ | ------ | ---------------------------------------- |
| `version`    | number | Always `3`.                              |
| `name`       | string | The plan name, as it appears in the app. |
| `lastEdited` | string | Date as `YYYY-MM-DD`. Use today's date.  |
| `sessions`   | array  | One per training day.                    |

## Session

```json
{
  "version": 6,
  "name": "Push",
  "notes": "Chest, shoulders and triceps.",
  "exercises": [ ... ]
}
```

| Field       | Type   | Notes                                              |
| ----------- | ------ | -------------------------------------------------- |
| `version`   | number | Always `6`. Not `3` - a session versions on its own. |
| `name`      | string | e.g. `"Push"`, `"Upper A"`, `"Leg Day"`.           |
| `notes`     | string | `""` if there's nothing to say.                    |
| `exercises` | array  | Weighted and cardio exercises can be mixed freely. |

## Weighted exercise

```json
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
```

| Field              | Type    | Notes                                                                                                                   |
| ------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------- |
| `type`             | string  | Exactly `"WeightedExerciseBlueprint"`.                                                                                  |
| `name`             | string  | The exercise name.                                                                                                      |
| `plannedSets`      | array   | One entry per set. See below.                                                                                           |
| `restBetweenSets`  | object  | See below.                                                                                                              |
| `supersetWithNext` | boolean | See supersets below.                                                                                                    |
| `notes`            | string  | Cues or instructions. `""` if none.                                                                                     |
| `link`             | string  | A URL explaining the movement. **Leave as `""` unless the user gave you a specific link** - do not invent or guess URLs. |
| `resistance`       | string  | Where the load comes from. See below.                                                                                   |
| `progression`      | array   | Automatic progression rules, possibly empty. See below.                                                                 |

### Planned sets

`plannedSets` is the whole set/rep scheme: one entry per set, each carrying that set's rep target.
Three sets of five is three identical entries. Reps are always a band, and `min === max` is a point
target:

```json
"plannedSets": [
  { "reps": { "min": 8, "max": 12 } },
  { "reps": { "min": 8, "max": 12 } },
  { "reps": { "min": 8, "max": 12 } }
]
```

Sets do not have to match each other - this is how you write a ramp or a back-off set:

```json
"plannedSets": [
  { "reps": { "min": 5, "max": 5 } },
  { "reps": { "min": 5, "max": 5 } },
  { "reps": { "min": 8, "max": 10 } }
]
```

A rep range only counts as a success at the **top** of the range, so `8-12` with a weight rule is
double progression: the weight goes up once every set hits 12.

### Resistance

Where the load on the movement comes from. One of:

| Value          | Use for                              | Effect                                                                                   |
| -------------- | ------------------------------------ | ---------------------------------------------------------------------------------------- |
| `"external"`   | Barbells, dumbbells, machines.       | The default. The weight logged is the weight lifted.                                     |
| `"bodyweight"` | Pull ups, dips, push ups.            | The weight logged is what is _added_ to the lifter (belt weight, or negative for assistance). |
| `"none"`       | Crunches, planks, air squats.        | No weight at all. The app hides weight while logging and in stats; reps are the whole story. |

Use `"none"` whenever added weight is not part of the exercise - it is better than `"external"` with a
weight of zero, which pollutes the stats with a zero-weight line.

### Rest

All three are required ISO-8601 durations.

| Field         | Meaning                                                                                 |
| ------------- | --------------------------------------------------------------------------------------- |
| `minRest`     | The shortest acceptable rest.                                                           |
| `maxRest`     | The longest.                                                                            |
| `failureRest` | Rest after a set where they missed the target reps - normally the longest of the three. |

Pick rests from the effort of the lift: heavy compounds 3–5 minutes, accessories 60–90 seconds.

### Supersets

There is no superset group. `"supersetWithNext": true` means "do this exercise back to back with the **next one in the array**, with no rest between them". To superset A with B, set it on A and leave it `false` on B. For a three-exercise circuit, set it `true` on the first two.

### Progression

`progression` is an **ordered list of rules**. After a session where every set hit its target, the app
takes the **first rule that still has room to move** and applies only that one. An empty list - `[]` -
means the exercise never moves on its own; use it for bodyweight work you are not loading, or when the
user doesn't want automatic progression.

The usual rule, and the one most exercises want:

```json
{
  "axis": "load",
  "step": "2.5",
  "scope": { "type": "allSets" },
  "trigger": "allSetsMetTarget"
}
```

| Field       | Type   | Notes                                                                                                                         |
| ----------- | ------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `axis`      | string | `"load"` (weight) or `"reps"`.                                                                                                |
| `step`      | string | How much to add, as a decimal **string**. Unitless: `"2.5"` is a pair of small plates in a kilo gym and in a pound gym alike. |
| `scope`     | object | `{ "type": "allSets" }`, or `{ "type": "lowestSets", "pick": "first" \| "middle" \| "last" \| "all" }`.                        |
| `trigger`   | string | Always `"allSetsMetTarget"` - the only trigger there is.                                                                      |
| `ceiling`   | string | _Optional, reps only._ The rule stops once reps reach this, and the next rule takes over.                                     |
| `onCeiling` | string | _Optional, reps only._ `"reset"` drops the reps back to what the plan asks once a later rule takes over.                      |

`step` is unitless - it is plate increments, not a weight. Use `"2.5"` for most lifts and `"5"` for
squats and deadlifts if the user lifts in kilos; `"5"` and `"10"` if they lift in pounds.

`"lowestSets"` raises only the lowest sets, for lifts where a jump across the board is too much
(lateral raises, most shoulder and arm isolation). "Lowest" is judged on the rule's own axis, so a reps
rule picks the smallest rep target, not the lightest set.

**Ordering matters.** A rule with no `ceiling` never runs out of room, so nothing after it can ever
run - and only reps rules take a ceiling. That means a load rule always goes **last**. A list of two,
reps then load, is a rep ladder:

```json
"plannedSets": [
  { "reps": { "min": 6, "max": 6 } },
  { "reps": { "min": 6, "max": 6 } },
  { "reps": { "min": 6, "max": 6 } }
],
"progression": [
  {
    "axis": "reps",
    "step": "1",
    "scope": { "type": "allSets" },
    "ceiling": "8",
    "onCeiling": "reset",
    "trigger": "allSetsMetTarget"
  },
  {
    "axis": "load",
    "step": "2.5",
    "scope": { "type": "allSets" },
    "trigger": "allSetsMetTarget"
  }
]
```

Six reps climb one at a time to eight, then the weight goes up and the reps drop back to six.

Don't do this _and_ write a rep range - a reps rule whose ceiling is the top of the exercise's own rep
range can never move, and does nothing at all. Pick one: a range with a load rule, or a point target
with a reps rule ahead of the load rule.

An exercise with `"resistance": "none"` has nothing to load, so reps are the only axis worth giving it
a rule on.

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

`sets` is an **array** here - one object per interval or round. There is no resistance or progression on cardio.

Every set needs a `target` plus all six `track*` booleans, which control the fields the app shows while logging. A set may also carry the same `restBetweenSets` object a weighted exercise takes; leave it out for steady-state work, where there is nothing to rest between. Turn on the ones that make sense for the movement (a bike: duration + resistance; a treadmill run: duration, distance, incline) and leave the rest `false`.

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
  plan/sessions/1/exercises/0/progression/0/step must be string
```

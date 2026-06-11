# LiftLog Workout Converter

Standalone single-page web app for converting loosely structured workout JSON into LiftLog import JSON.

## What It Converts

Input can be similar to [docs/strength.json](../../docs/strength.json) or from external tools with slight schema differences.

Output format is LiftLog's plan import wrapper:

```json
{
	"type": "LiftLogPlanExport",
	"formatVersion": 1,
	"program": {
		"name": "...",
		"lastEdited": "YYYY-MM-DD",
		"sessions": []
	}
}
```

## Supported Input Variations

- Program name keys: `name`, `program_name`, `programName`, `title`
- Session list keys: `sessions`, `days`, `workouts`, `schedule`
- Session title keys: `name`, `title`, `day`
- Exercise list keys: `exercises`, `movements`, `items`
- Exercise fields: `name/title`, `sets/setCount/rounds`, `reps/repRange/repsPerSet/target`

## Conversion Behavior

- Detects cardio when:
- Exercise type is explicitly cardio
- Reps/target looks time-based (for example `30 sec`, `15 min`, `30-60 sec`)
- Exercise name contains common cardio keywords (for example `plank`, `jump rope`, `bike`)
- Weighted exercises become `WeightedExerciseBlueprint` with LiftLog defaults.
- Cardio exercises become `CardioExerciseBlueprint` with per-set time targets.
- When values cannot be parsed reliably, defaults are used and warnings are shown in the UI.

## Run

From [tools/workout-converter](.):

```bash
npm test
npm run start
```

Then open:

- http://localhost:4173

## Tests

Tests are in [tools/workout-converter/test/converter.test.mjs](test/converter.test.mjs) and cover:

- Conversion from [docs/strength.json](../../docs/strength.json)
- Wrapper input normalization
- Loose external schema key handling
- Invalid JSON input handling
- Missing sessions validation

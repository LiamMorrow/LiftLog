# Import from other apps

Import workout history from a third-party CSV into LiftLog sessions. This is separate from
[Plaintext export](./PlaintextExport.md): LiftLog’s own CSV/JSON export is one-way and is not
accepted as an import format.

## How to use

1. In the source app, export workout history as CSV (columns for the chosen format below).
2. In LiftLog: `Settings → Export, backup, and restore → Import from other apps`.
3. Choose **Format**, tap **Import**, and pick the file. Workouts appear in History after a
   successful import.

## Behaviour

- Rows are grouped into sessions (see each format for the grouping key).
- Session IDs are **content-derived** (UUID v5 over date + ordered exercises/sets: reps, weight,
  unit, notes). Re-importing the same rows is a no-op: workouts whose IDs already exist in History
  are skipped. A larger re-export only adds sessions for new or changed set content. Deleting an
  imported session and importing again restores it (same ID is no longer present).
- Existing sessions and programs are not wiped; new sessions are merged via the same path as Restore
  (`importBackupData`).
- Weighted sets only (v1); cardio-only / timed-only rows are skipped.
- Set comments / notes become exercise notes. Rest timers and progressive overload use LiftLog
  defaults.

## Formats

### FitNotes-style CSV

UI label: **FitNotes-style CSV** (internal format value: `CSV`). Portable contract is the
FitNotes-style CSV header row (not the binary `.fitnotes` database — that format is out of scope).

Expected columns:

`Date`, `Exercise`, `Category`, `Weight`, `Weight Unit`, `Reps`, `Distance`, `Distance Unit`,
`Time`, `Comment`

Required for a successful parse: `Date`, `Exercise`, `Weight`, `Weight Unit`, `Reps`.

- Grouping: one session per calendar date.
- Weight units come from the CSV when present; missing units fall back to the app preference.
- **Imported:** date, exercise name, weight, weight unit, reps, comment.
- **Not imported:** category, distance, distance unit, time (cardio).

### StrongLifts-style CSV

UI label: **StrongLifts-style CSV** (internal format value: `StrongLifts`). Export from StrongLifts
(workout history CSV). One CSV row is one exercise; individual sets are columns.

Expected columns (header names from a real export):

`Date (yyyy/mm/dd)`, `Workout`, `Workout Name`, `Program Name`, `Body Weight (KG|LB)`, `Exercise`,
`Sets×Reps`, `Sets×Time`, `Top Set (…)`, `e1RM (…)`, `Reps`, `Volume (…)`, `Workout Volume (…)`,
`Duration (hours)`, `Start Time (h:mm)`, `End Time (h:mm)`, `Notes`, then repeating
`Set N (Reps)`, `Set N (KG|LB)` (N ≥ 1; sample exports use 1–5).

Required: a date column (`Date (yyyy/mm/dd)` or `Date`), `Exercise`, and at least one
`Set N (Reps)` + `Set N (KG|LB)` pair. Weight unit is taken from those headers (KG vs LB).

- Grouping: one session per **date + Workout** number (A/B on the same day stay separate).
- Session name comes from `Workout Name`.
- Sets with empty or **0 reps** are skipped (StrongLifts uses 0 for both skipped slots and failed
  sets in the set columns).

| Imported | Not imported |
|----------|----------------|
| Date | Program name (not linked to a LiftLog plan) |
| Workout name → session name | Sets×Reps / Sets×Time summaries |
| Exercise name | Top set, e1RM, total reps/volume aggregates |
| Set reps + weight (per Set N columns) | Duration, start/end time |
| Notes → exercise notes | Timed-only work (`Sets×Time` without weight sets) |
| Body weight → session bodyweight | |

## Implementation

- Parser/mapper: `app/src/services/csv-import/` — `getImportForFitNotes`, `getImportForStrongLifts`,
  `sessionIdFromCsvContent` for stable IDs.
- Settings effect: `importFromExternal` → `import-external-effects.ts` filters out session IDs
  already in `storedSessions`, then `importBackupData` + `setStatsIsDirty` (or an already-imported
  snackbar when nothing is new).
- Local sample files (if any) live only under gitignored `tests/csv-import-test-files/`; unit tests
  use inline CSV excerpts.

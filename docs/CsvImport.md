# Import from other apps

You can bring workout history from another app into LiftLog by importing a CSV export. Imported
workouts are added to History. Nothing already in LiftLog is deleted or overwritten.

This is not the same as [plaintext export](./PlaintextExport.md). LiftLog’s own CSV and JSON
exports cannot be imported back in.

## How to import

1. In the other app, export your workout history as a CSV (see [Supported formats](#supported-formats)
   for what the file should look like).
2. In LiftLog, go to **Settings → Export, backup, and restore → Import from other apps**.
3. Choose the matching **Format**, tap **Import**, and pick the file.

After a successful import, the workouts show up in History. If every workout in the file is already
there, LiftLog tells you nothing new was added.

## What to expect

- Your existing workouts and programs stay put. Import only adds sessions.
- Importing the same file again does not create duplicates.
- A later export only adds workouts for days or slots that are not already in History. Changing
  sets or comments in the other app and exporting again does not update or duplicate a workout
  you already imported. Delete that workout in History and import again if you want the new
  version.
- If you delete an imported workout and import the same file again, it comes back.
- Only weighted sets are imported. Cardio-only or timed-only rows are skipped.
- Comments and notes from the file become exercise notes. Rest timers and progressive overload use
  LiftLog’s usual defaults.

## Supported formats

Choose the format in the app that matches the file you exported.

### FitNotes-style CSV

Export a CSV from FitNotes for Android (not the `.fitnotes` database file).

The file should have a header row with at least **Date**, **Exercise**, **Weight**, **Weight Unit**,
and **Reps**. A typical FitNotes CSV export also includes Category, Distance, Distance Unit, Time, and
Comment.

- All sets on the same calendar day become one workout. 
- Weight units come from the file when present; otherwise LiftLog uses your app unit preference.
- **Imported:** date, exercise name, weight, weight unit, reps, comment.
- **Not imported:** category, distance, and time (cardio). Those columns can still be in the file.

### StrongLifts-style CSV

Export workout history as CSV from StrongLifts. Each row is one exercise; individual sets are
separate columns.

The file should have a date column `Date (yyyy/mm/dd)`, an `Exercise` column, and
pairs of `Set N (Reps)` / `Set N (KG)` or `Set N (LB)` columns (N is 1, 2, 3, …). Weight unit
is taken from those headers.

- Each date plus workout letter (A or B) is a separate session, so A and B on the same day stay
  separate.
- The workout name in the file becomes the session name in LiftLog.
- Sets with empty or **0 reps** are skipped (StrongLifts uses 0 for unused slots and failed sets).

| Imported | Not imported |
|----------|----------------|
| Date | Program name (not linked to a LiftLog plan) |
| Workout name → session name | Sets×Reps / Sets×Time summaries |
| Exercise name | Top set, e1RM, total reps/volume |
| Set reps + weight (per Set N columns) | Duration, start/end time |
| Notes → exercise notes | Timed-only work (`Sets×Time` without weight sets) |
| Body weight → session bodyweight | |

## How it works (for contributors)

The in-app **Read documentation** button opens this page; the sections above are
the user-facing guide.

Rows are parsed, grouped into sessions (see each format), then turned into `BackupData` and merged
with the same path as Restore (`importBackupData`). Session IDs are grouping-key derived: UUID v5
over the FitNotes calendar date, or StrongLifts date + Workout id (A/B) - not Workout Name, and not
sets or notes. Re-import skips IDs already in History (first import wins). Changing sets or comments
in the source app and exporting again does not create a second session for that day; delete the
imported session and import again to refresh it. Stats invalidation (`setStatsIsDirty`) runs on the
external-import path only, not inside full backup restore.

Internal format ids (UI dropdown / `importFromExternal`): `FitNotes` | `StrongLifts`. These are
unrelated to plaintext export’s own `CSV` value.

```text
UI dropdown  ←── EXTERNAL_IMPORT_FORMATS (id, labelKey, import)
importFromExternal({ format })
  → pickFile
  → getExternalImporter(format)(bytes, { defaultWeightUnit })
       → format-specific parse + group → NormalizedImportSession[]
       → sessionsFromNormalized() → BackupData { workouts, programs: {} }
  → filter session ids already in storedSessions
  → importBackupData(...); setStatsIsDirty(true)   // external path only
```

- Package: `app/src/services/csv-import/`
  - `external-import-formats.ts` — registry (`FitNotes` | `StrongLifts`)
  - `fitnotes-csv.ts` / `stronglifts-csv.ts` — parse + normalize
  - `csv-to-sessions.ts` — `sessionsFromNormalized`, `sessionIdFromCsvContent`
  - `importers.ts` — `getImportForFitNotes` / `getImportForStrongLifts`
  - `csv-parse-utils.ts` — shared cell/number/Papa preamble helpers
- Settings effect: `import-external-effects.ts` uses the registry; filters existing session IDs;
  dispatches `importBackupData` + `setStatsIsDirty` (or already-imported snackbar).

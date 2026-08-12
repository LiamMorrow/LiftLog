# Docs index

Every doc in this directory, with a one-line description of what it covers. Skim this before starting
work to find the docs relevant to your area, and update it whenever you add, remove, or repurpose a doc.

## Architecture and patterns

- [Storage.md](./Storage.md) - the two on-device storage layers: preferences (`PreferenceService`, one
  file per key) and user data (SQLite via Drizzle). Both are injected into Redux effects via `extra`.
  Covers which to use, how to add to each, and the startup hydration order.
- [Migrations.md](./Migrations.md) - the `createMigrations()` chain in `app/src/models/storage/versions/`
  that brings previously-persisted JSON up to the shape the app expects. Read alongside `Storage.md`.
- [WorkoutWorker.md](./WorkoutWorker.md) - the platform-specific, message-driven execution environment
  for an in-progress workout (persistent notifications, background timers, system UI). Redux stays the
  source of truth; the worker is disposable.

## Features

- [FeedProcess.md](./FeedProcess.md) - the opt-in social feed: the follow/accept flow, what is and isn't
  visible to the server, and the end-to-end encryption model (AES-CBC payloads, RSA-PSS signatures).
- [PlanFileFormat.md](./PlanFileFormat.md) - the `.liftlogplan` file format, how plans are imported and
  exported, and the Claude skill that authors plan files against the schema.
- [PlaintextExport.md](./PlaintextExport.md) — CSV/JSON export of workout data, including which fields
  are included. Explicitly _not_ a backup mechanism; LiftLog cannot read these files back.
- [CsvImport.md](./CsvImport.md) — Import from other apps: third-party CSV history (FitNotes-style
  and StrongLifts-style) merged via `importBackupData`; separate from plaintext export.
- [RemoteBackup.md](./RemoteBackup.md) — the automatic remote backup: the app-side settings, the HTTPS
  requirement, and the contract a self-hosted backup endpoint must satisfy.

## Generated

- [schemas/](./schemas) - JSON schemas generated from the app's models: `ai-plan/`,
  `program-blueprint/`, `workout-worker/`. Regenerate with `npm run json-schema` from `app/`; never
  hand-edit.
- [img/](./img) - images referenced by the docs above.

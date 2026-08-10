---
name: add-storage-migration
description: >-
  Use when changing the shape of any on-device persisted model (session, blueprint/program, feed,
  exercise-descriptor, ai-plan) or adding a new persisted model - i.e. any edit under
  app/src/models/storage/versions/, or when a build<...>() chain stops compiling because a `latest/`
  type changed. Covers the createMigrations() append-only chain, dependsOn for nested models, and the
  json-schema regen that must ship with the change.
---

# Adding / changing a storage migration

LiftLog persists everything on-device as JSON. Stored data does not change when the app's types do, so
every model has a **migration chain** that brings any previously-persisted shape up to the current one.
Full reference: `docs/Migrations.md`. Code: `app/src/models/storage/versions/`.

**Read `docs/Migrations.md` before doing anything non-trivial** (nested models, brand-new models, feed
ingest/version-rejection). This skill is the fast path for the common case.

## Directory layout (what each folder is)

- `initial/` - the **oldest** persisted shape of every model. The _input_ to every chain. **Frozen** -
  never edit or remove an existing interface; you may only _add_ a new one for a brand-new model.
- `latest/` - the **current** shape, hand-declared and the **source of truth**. Yours to edit freely.
  Self-contained: duplicate the definition here, never re-export from `initial/`.
- `migrations/` - the chains, one file per domain (`blueprint.ts`, `session.ts`, `feed.ts`,
  `exercise-descriptor.ts`, `ai-plan.ts`). `migrator.ts` is the builder. Reusable transforms live in
  `migrations/steps/`.
- `any/` - `AnyVersion*` union types (every persisted version). Type of a freshly-decoded, not-yet-migrated value.
- `libs/` - serialized primitives that never version (dates, durations, crypto keys, BigNumber).

## Changing an existing model (the common case)

1. **Edit the type in `latest/<domain>.ts`** to the new desired shape.
2. That domain's `build<...>()` in `migrations/<domain>.ts` **stops compiling** - its output no longer
   matches the latest type. This compile error is the signal, not a nuisance.
3. **Append one new `.add()`** to the chain transforming the previous shape into the new one. Set
   `version` to the `as const` number TypeScript asks for (it enforces the incrementing value). Keep the
   per-field transform explicit, mirroring the existing steps.
4. Non-trivial or reused field logic → put it in a **new file under `migrations/steps/`** and call it
   from the `.add()` (see `steps/add-uses-bodyweight.ts`, imported into `blueprint.ts`).
5. If the model **embeds another versioned model**, do **not** hand-migrate the child - the parent uses
   `dependsOn({ field: childMigrations })` and re-verifies automatically. Only touch the parent when the
   parent's _own_ fields change.
6. If the changed type feeds a generated JSON schema (anything reachable from workout-worker messages or
   the program blueprint), regenerate and **commit** the artifacts:
   ```bash
   cd app && npm run json-schema
   ```
   This also rebuilds the plan-file validator shipped in the plan-builder skill. Both are committed.
7. Add/extend a round-trip test - see `migrations/real-migrations.spec.ts` and `migrator.spec.ts`.

## Reference example

`migrations/blueprint.ts` - `sessionBlueprintMigrations` is a clean chain (`createMigrations<Initial…>()`
→ three `.add()` steps stamping `version: 2/3/4` → `.build<SessionBlueprintJSON>()`), and
`programBlueprintMigrations` shows a pure wrapper using `dependsOn({ sessions })` +
`pseudoMigrateUntil`.

## Hard rules (violating these corrupts real user data)

- **Never edit an existing `.add()` step.** Migrations are append-only - each step transforms data
  already on users' devices.
- **Never edit or remove an existing `initial/` interface.** It describes the oldest data still in the
  wild and must stay frozen. Adding a new interface is fine.
- **Never pass a raw stored payload to `fromJSON`.** Run it through the model's `migrate()` first - the
  any-version payload type enforces this at compile time, so a read site that won't compile is telling
  you to migrate.
- Always update `latest/` **and** add the migration together - never one without the other.

## Verify

From `app/`: `npm run typecheck` (the `build<...>()` pin must be green) and `npm test` (migration specs).
Run `npm run lint` before calling it done.

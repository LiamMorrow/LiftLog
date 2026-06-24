# Storage Migrations

LiftLog stores everything on-device as JSON (sessions, programs, the social
feed, etc.). Those shapes change over time, but data already on a user's phone
does not. **Migrations** bring any previously-persisted value up to the shape the
app currently expects.

All of this lives in
[`app/src/models/storage/versions/`](../app/src/models/storage/versions).

---

## The big picture

A model's history is described by a **migration chain** built with a small fluent
builder:

```ts
export const sessionBlueprintMigrations = createMigrations<InitialSessionBlueprintJSON>() // oldest persisted shape (the input)
  .add((value) => ({
    /* v1 -> v2 transform */
  }))
  .add((value) => ({
    /* v2 -> v3 transform */
  }))
  .build<SessionBlueprintJSON>(); // hand-declared latest shape (the output)
```

- **Intermediate `.add()` steps are inferred** — you never write types for them.
- **The first and last shapes are hand-declared.** The input comes from
  `initial/`, the output is pinned to the latest type from `latest/` via
  `build<TFinal>()`.

At runtime you migrate a stored value with `migrate()` (to the latest version) or
`migrateUntil(value, n)` (to a specific version — see
[Nested models](#nested-models)).

---

## Directory layout

| Folder                                                         | What it is                                                                                                                                                                                           |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`initial/`](../app/src/models/storage/versions/initial)       | The **oldest** persisted shape of every model, plus building-block types. This is the _input_ to every chain. Hand-written interfaces.                                                               |
| [`migrations/`](../app/src/models/storage/versions/migrations) | The migration chains, one file per domain (`blueprint`, `session`, `feed`, `exercise-descriptor`). [`migrator.ts`](../app/src/models/storage/versions/migrations/migrator.ts) is the builder itself. |
| [`latest/`](../app/src/models/storage/versions/latest)         | The **current** shape of every model — hand-declared and **treated as the source of truth.** `index.ts` is a pure barrel; each leaf mirrors `initial/`.                                              |
| [`any/`](../app/src/models/storage/versions/any)               | `AnyVersion*` union types (every possible persisted version of a model). Used to type a freshly-decoded value _before_ it has been migrated.                                                         |
| [`libs/`](../app/src/models/storage/versions/libs)             | Serialized primitives that never version (dates, durations, crypto keys, `BigNumber`).                                                                                                               |

### Why `latest` is the source of truth

The output of each chain is **pinned** to the latest type with
`build<TFinal>()`. The builder asserts (via `NoInfer` + a mutual-assignability
check) that what the chain actually produces matches the hand-declared latest
type. If they drift apart, **the chain stops compiling**. That compile error is
the whole point — it forces you to add a migration whenever you change a model.

---

## Changing an existing model

This is the common case. Follow these steps:

1. **Update the type in `latest/<domain>.ts`** to the new desired shape.
2. The corresponding chain's `build<...>()` call will **no longer compile** — its
   output no longer matches the latest type.
3. **Append a new `.add()`** to that chain describing how to transform the
   previous shape into the new one. Set the `version` field to the value
   TypeScript asks for (the builder enforces the correct, incrementing number).
4. If your model **embeds another model** that has its own chain, migrate the
   nested value with `migrateUntil` (see below).
5. If the changed type feeds a generated JSON schema (e.g. anything reachable
   from the workout-worker messages), regenerate the schemas:
   ```bash
   cd app && npm run json-schema
   ```

### Adding a brand-new model

1. Add the initial interface(s) to the appropriate `initial/` file.
2. Hand-declare the latest shape in the matching `latest/` file (for a brand-new
   model these are identical to start with — **duplicate** the definition, don't
   re-export it; see the rules below).
3. Create the chain in `migrations/` with
   `createMigrations<Initial…>().build<Latest…>()`.

---

## Nested models

When a model embeds another model that has its **own** migration chain, don't
hand-roll the child's migration — delegate to the child chain with
`migrateUntil(child, n)`, bringing the child up to the version this parent
version expects:

```ts
export const programBlueprintMigrations = createMigrations<InitialProgramBlueprintJSON>()
  .add((value) => ({
    version: 2,
    name: value.name,
    lastEdited: value.lastEdited,
    // each session blueprint is migrated to v2 by its own chain
    sessions: value.sessions.map((s) => sessionBlueprintMigrations.migrateUntil(s, 2)),
  }))
  .build<ProgramBlueprintJSON>();
```

This keeps every embedded value at a known, consistent version and avoids
duplicating the child's transformation logic.

---

## Rules

- **Update the model in `latest/`, then add a migration.** Never change a
  latest shape without adding the corresponding `.add()` step (the compiler will
  stop you anyway).
- **Never touch an existing migration.** Each `.add()` step transforms real data
  already on users' devices. Editing one rewrites history and corrupts
  migration of older data. Migrations are append-only.
- **Never edit existing `initial/` interface definitions.** They describe the
  oldest data that still exists in the wild and must stay frozen. You may _add_
  new interfaces to `initial/` (for a new model), but never modify or remove an
  existing one.
- **`latest/` is yours to edit freely** — it's the source of truth for the
  current shape.
- **`latest/` is self-contained: duplicate, don't forward.** Even when a latest
  type is currently identical to its `initial/` counterpart, declare it in full
  in `latest/` rather than re-exporting from `initial/`. This keeps `latest` an
  independent description of the current shape and keeps JSON-schema generation
  working.
- **Use `migrateUntil` for nested models** rather than reimplementing a child's
  migration inside its parent.

---

## See also

- [`migrator.ts`](../app/src/models/storage/versions/migrations/migrator.ts) —
  the builder, the `build<TFinal>()` pin, and `migrate`/`migrateUntil`.
- [Workout Worker](./WorkoutWorker.md) — consumes generated JSON schemas built
  from these types.

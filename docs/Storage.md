# Storage

LiftLog persists on-device data in two places. Which one you use depends on what kind of data it is:

|                          | Preferences                                                      | User data                                                                               |
| ------------------------ | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Written through          | `PreferenceService`                                              | Drizzle ORM (`db`)                                                                      |
| Backed by                | One file per key in the app document directory (`KeyValueStore`) | SQLite (`db.db`, via expo-sqlite)                                                       |
| Holds                    | Settings and small scalars the user toggles                      | Sessions, programs, exercises, feed state                                               |
| Shape changes handled by | Hand-written defaults in the getter                              | Drizzle SQL migrations + JSON payload migrations (see [Migrations.md](./Migrations.md)) |
| Injected as              | `extra.preferenceService`                                        | `extra.db`                                                                              |

Both are built in `app/src/services/index.ts` (`createServices`) and are reachable from any Redux effect
via the `extra` bag:

```ts
addEffect(
  setUseImperialUnits,
  async (action, { stateAfterReduce, extra: { preferenceService } }) => {
    if (stateAfterReduce.settings.isHydrated) {
      await preferenceService.setUseImperialUnits(action.payload);
    }
  },
);
```

Redux is the source of truth at runtime. Storage is written **from effects**, never from components or
reducers: a component dispatches an action, the reducer updates state synchronously, and an effect
mirrors the change to disk.

## Preferences - `PreferenceService`

`app/src/services/preference-service.ts` wraps `KeyValueStore`
(`app/src/services/key-value-store.ts`), which stores each key as its own file under `Paths.document`.
Writes go to a temp file and are then moved over the target, so a crash mid-write can't leave a
half-written (or worse, half-overwritten) value.

Everything in the store is a string (or `Uint8Array`). Preferences are described declaratively in a
**registry** (`app/src/store/settings/registry.ts`); each entry pairs a `default` with a **codec**
(`app/src/store/settings/codecs.ts`) that owns the on-disk encoding:

```ts
restTimersEnabled: pref({ default: true, codec: boolCodec }), // 'True' / 'False', default true when unset
```

`PreferenceService` is a thin facade over the registry: `getPreference(key)` / `setPreference(key, value)`
read and write via the codec, and a few bespoke methods remain for keys with special storage
(`getPreferredLanguage`, the remote-backup cluster).

### Adding a preference

The `add-setting-or-preference` skill walks this end to end. In short: add one entry to
`preferenceRegistry` (`{ default, codec }`), then re-export the generated `set<Name>` action from
`app/src/store/settings/index.ts` and add the settings UI. The state field, default, action, hydration,
and `isHydrated`-guarded write-back are all derived from the registry entry - no `PreferenceService`
method or per-key effect. Keys with special needs use the `persist: false` / `hydrate: 'manual'` /
`sync` escape hatches on the descriptor.

### Reading synchronously

`getItemSync` / `getPreferredLanguage` exist for the handful of values needed before the store exists
(language, for Tolgee setup). Prefer the async path everywhere else.

### Direct `keyValueStore` use

A few non-settings blobs skip `PreferenceService` and use `extra.keyValueStore` directly - the hidden
built-in exercise id list, the "built-in programs seeded" marker. That's the escape hatch for a value
that isn't a user-facing setting but is too small or too structurally awkward for a table. New
_settings_ should go through `PreferenceService`.

The in-progress workout used to live here too, under `CurrentSessionStateV1`. It is now a row in the
`session` table like any other, flagged `active`;
`store/stored-sessions/legacy-current-session.ts` lifts a leftover blob into the table on first launch
and then deletes the keys.

## User data - SQLite via Drizzle

Schema lives in `app/src/db/schema.ts`; generated SQL migrations in `app/src/drizzle/`. The database is
opened in `components/smart/services-provider.tsx` (`openDatabaseAsync('db.db')` → `drizzle(expoDb)`)
and passed into `createStore` / `createServices`, so effects get it as `extra.db` (and the raw handle as
`extra.expoDb`, needed for backup/export).

**Foreign keys** are enforced from the end of `DatabaseMigrationService.migrate()`. The pragma is per
connection and is a no-op inside a transaction, and drizzle runs each batch of migrations in one, so
turning it on earlier would let a migration that rebuilds a parent table cascade-delete its children.

Most tables are the same shape - a text `id` primary key plus a `payload` JSON column typed with the
model's `AnyVersion…JSON` union:

```ts
export const programsSchema = sqliteTable("program", {
  id: text().primaryKey(),
  payload: text("payload", { mode: "json" }).$type<AnyVersionProgramBlueprintJSON>().notNull(),
});
```

Sessions are the exception: they are relational - see [Sessions are relational](#sessions-are-relational).

Four mechanisms change what is stored, and all of them matter:

- **SQL migrations** change tables/columns/indexes. Edit `db/schema.ts`, then generate with
  `npx drizzle-kit generate` (config: `app/drizzle.config.ts`) and commit the new file in
  `src/drizzle/`.
- **JS migrations** (`app/src/services/js-migrations/`) move data in JS at a fixed point in the SQL
  sequence, for a reshape SQL cannot express - see [JS migrations](#js-migrations).
- **Data migrations** (`app/src/services/data-migrations/`, run by `DatabaseImportService`) bring in
  data from outside the database: the key-value files older versions stored everything in, and
  device preferences. They run once per device, after every SQL and JS migration, so they always
  read and write the latest tables.
- **Payload migrations** change the shape of the JSON inside a row. Those are the versioned model
  chains in `app/src/models/storage/versions/` - see [Migrations.md](./Migrations.md) and the
  `add-storage-migration` skill. Rows are migrated on read (`programBlueprintMigrations.migrate(row.payload)`),
  not in bulk.

`DatabaseMigrationService.migrate()` runs the first three at startup, in that order. A restored
backup runs SQL and JS migrations too, but not data migrations: the device's key-value files and
preferences are not part of the backup.

### JS migrations

A JS migration is `{ id, after, run }`. `after` is the tag of the SQL migration it follows (the journal
entry in `src/drizzle/meta/_journal.json`): `migrate()` runs the SQL migrations up to and including
that one, then the JS migration, then the rest. That ordering lets it read a table that a later SQL
migration drops.

- `run` gets a transaction that also records `id` in `data_migration`, so it is all-or-nothing and
  runs once per database. It must be synchronous (see [Transactions are synchronous](#transactions-are-synchronous)).
- It runs on restored backups as well as the live database, so it may only touch the database it is
  given.
- Pin it to the SQL migration added in the same change. A database already past `after` would run it
  against a later schema.
- Declare the tables it touches inside the migration file, as they are at `after`, rather than
  importing from `db/schema.ts`. A later column change to the live schema must not change what an
  old migration reads or writes.
- Each one runs on its own drizzle instance over the same connection. drizzle caches column names per
  table name on each instance, so an old copy of a table would otherwise hide columns added since.

### Reading and writing

Read on hydration, dispatch into the slice:

```ts
const programs = (await db.select().from(programsSchema)).reduce(
  toRecord(
    (x) => x.id,
    (row) => ProgramBlueprint.fromJSON(programBlueprintMigrations.migrate(row.payload)),
  ),
  {},
);
dispatch(setSavedPlans(programs));
```

Write with the `upsert` helper in `app/src/db/helpers.ts`, which does an
`insert … onConflictDoUpdate` on the id - the right call for our id+payload tables, and it takes a
transaction (`tx`) as well as `db`:

```ts
upsert(db, feedSentReactionsSchema, [{ id: action.payload.id, payload: action.payload.toJSON() }]);
```

### Transactions are synchronous

Use `db.transaction((tx) => …)` when several tables must move together. Drizzle's expo driver runs
every query synchronously, and `db.transaction()` commits as soon as its callback returns, so **the
callback must be synchronous**: end each statement with `.run()`, `.all()` or `.get()`, and do any async
work (preferences, key-value store, network) before the transaction.

```ts
db.transaction((tx) => {
  tx.delete(programsSchema).run();
  tx.insert(programsSchema).values(rows).run();
});
```

An `async` callback typechecks but commits before its awaited statements run, so none of them are
covered by the transaction and a failure part way through cannot roll back
(`app/src/db/transaction.spec.ts` shows both cases). A synchronous transaction cannot interleave with any
other query, so transactions never nest.

Drizzle throws on an `insert` with no values. Inside a transaction that rolls back everything before it,
so guard a delete-then-reinsert with `if (rows.length)`.

### Testing

Effects that touch the DB use a real in-memory SQLite rather than a mock - `openDatabaseAsync(':memory:')`,
`drizzle(...)`, then `DatabaseMigrationService.migrate()` to build the schema. See
`app/src/store/program/effects.spec.ts` for the pattern and `utils/__test__/add-effect-testbed` for
wiring effects to a test store.

`app/test/shims/expo-sqlite.ts` implements expo-sqlite's synchronous API on Node's built-in
`node:sqlite`, so tests run drizzle's real expo driver with the device's behaviour: synchronous queries
and transactions, and foreign keys off unless a connection turns them on.

### Sessions are relational

A session is spread over four tables, so its history can be queried in SQL:

| Table               | Holds                                                                                                                                                               |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `session`           | name, notes, date (indexed), bodyweight, the `active` flag, and its summary                                                                                         |
| `recorded_exercise` | one per exercise, keyed `(sessionId, ord)`, with indexed `movementKey` and `progressionKey`, plus its blueprint: scalars as columns, lists as JSON, and its summary |
| `weighted_set`      | one per potential set: target, weight, reps and completion time                                                                                                     |
| `cardio_set`        | one per cardio set: its set blueprint as columns, plus each recorded metric                                                                                         |

- `app/src/db/sessions.ts` is the only code that touches these tables. It writes with `writeSession`,
  `deleteSession` and `setActiveSession`, and reads with queries shaped for their callers:
  - whole sessions by id, by date range, or the active one;
  - `readPreviousExercises` (the latest finished performance of each `progressionKey`, leaving out the
    session on screen) and `readPreviousComparableSession` for the workout screens, and
    `readExerciseHistory` (every performance of one `movementKey`) for the exercise history sheet;
  - `readSessionToContinueFrom` and `readLatestExercises` (the most recently completed performance per
    `progressionKey`), which `SessionService` builds upcoming sessions from;
  - `readStartedSessionVolumes` and `readPersonalRecords`, which read the whole history's summaries for
    the activity views. Each one has a spec that checks it against the JS it replaces (`sessionVolume`,
    `findPersonalRecords`) over generated sessions.

  It maps through `SessionJSON`, so `toJSON` / `fromJSON` stay the source of truth for the shape.

- Effects write synchronously inside the dispatch that changed the store, so a query run from a later
  effect sees what the store holds.
- `writeSession` rewrites the whole session: it upserts the `session` row, deletes its children and
  inserts them again. A new session is stored inactive and an existing one keeps its flag. Never write a
  session row with `INSERT OR REPLACE`: it deletes the row first, which cascades to its children.
- Reads that span the whole history use each session's **summary** rather than its sets, so their cost
  follows the number of sessions, not sets:
  - `session.volumeKg`: kilograms moved across its completed sets.
  - `session.lastCompletedAtMs`: its latest completed set, weighted or cardio. Null when nothing is
    completed, so it also marks a started session. Sessions are ordered by it, falling back to the start
    of their date.
  - `recorded_exercise.bestOneRepMaxKg`: the exercise's best estimated one-rep max, null when it has no
    set that counts.

  `writeSession` computes the summary in SQL from the `effective_weighted_set` view once the children
  are written, so it can never disagree with the sets. Anything else that changes a stored set must
  call `writeSummaries` for the sessions it touched, as `MIGRATE_NIL_WEIGHT_UNITS` does. The
  `0011_session_summary` migration fills it in for sessions stored before it existed, with the same
  expressions.

## Which one do I use?

Use **preferences** for a single scalar the user sets and the app reads - a toggle, a colour, a token, a
timestamp. Use **SQLite** for anything the user creates in quantity, anything queried or deleted by id,
and anything that needs to survive versioned shape changes.

Startup order is `initializeSettingsStateSlice` → (once settings are hydrated)
`initializeStoredSessionsStateSlice`. Preferences are therefore available to DB hydration, but not the
other way round; `stored-sessions/effects.ts` asserts this explicitly.

## Sessions, and the one in progress

The session history lives in SQLite, not in Redux. `storedSessions.openSessions` holds only the sessions
being edited: the workout in progress, and a past session while it is open in History. Startup loads the
active one and nothing else. `activeSessionId` points at the live one.

- **Editing goes through the store.** A screen addresses an open session by id
  (`updateStoredSession({ sessionId, update })`, mirroring `updateProgram`), so two screens editing
  different sessions cannot collide, and effects write the result through to SQLite.
  - `putStoredSession` opens a session and writes it.
  - `openSession` opens one that came from the database, without writing it. History opens a session
    this way before pushing `/history/edit`.
  - `sessionFinished` closes it again, except the workout in progress, which stays open until it is
    finished.
  - `selectSession(state, id)` only finds an open session. To show one that may not be open, use
    `useSession(id)` (`hooks/useSession.ts`), which falls back to reading it from SQLite.
- **Reading history goes to SQLite.** Screens read through `useSessionsQuery(read, key)`
  (`hooks/useSessionsQuery.ts`):
  - A focused screen reads straight away. A screen that is not focused reads in `requestIdleCallback`.
    Every tab renders at startup, so reading on mount would put the read on the launch path. Waiting
    for focus would show an empty tab instead, because a native tab switch is on screen before JS hears
    about it.
  - It reads again when `key` changes or `sessionsRevision` moves.
  - Effects call the `db/sessions.ts` reads directly.
- **`sessionsRevision` moves when the set of finished sessions changes:** a session finished, deleted,
  restored from a backup, or a change of active session. It does not move on each recorded set, so a
  screen mounted behind the workout does not re-read per tap. The effects bump it with `sessionsChanged`
  only after their write has landed.
- **Whole-history aggregates are summarised, not held.** The History and Feed tabs wrap their content in
  `OwnHistoryProvider`. Once per revision it reads one volume per started session and the personal
  records, both from the stored session summaries, and `ownHistoryOf` turns them into per-day counts and
  volume, the volume scale and the streak. No `Session` is built. The activity selectors take that summary as an argument and combine it with the feed.
- `putStoredSession` / `updateStoredSession` mean "this session changed" and only write its content.
  `sessionFinished` means "the user is done with it". It is what queues the feed publish, exports to the
  health aggregator, marks stats dirty, clears the active pointer and closes the session. Keep completion
  work on `sessionFinished`, or it fires once per set.

The `active` column has a single writer, the `setActiveSessionId` effect (`setActiveSession`), in a
transaction with a unique partial index (`single_active_session`) enforcing at most one - the same shape
the `program` table uses for the active plan. It writes the session's content as well, because it races
the content write it is dispatched alongside.

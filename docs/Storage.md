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

Tables are almost all the same shape - a text `id` primary key plus a `payload` JSON column typed with
the model's `AnyVersion…JSON` union:

```ts
export const sessionsSchema = sqliteTable("session", {
  id: text().primaryKey(),
  payload: text("payload", { mode: "json" }).$type<AnyVersionSessionJSON>().notNull(),
});
```

This means there are **two** independent migration mechanisms and both matter:

- **SQL migrations** change tables/columns/indexes. Edit `db/schema.ts`, then generate with
  `npx drizzle-kit generate` (config: `app/drizzle.config.ts`) and commit the new file in
  `src/drizzle/`. They are applied at startup by `DatabaseMigrationService.migrate()`.
- **Payload migrations** change the shape of the JSON inside a row. Those are the versioned model
  chains in `app/src/models/storage/versions/` - see [Migrations.md](./Migrations.md) and the
  `add-storage-migration` skill. Rows are migrated on read (`sessionMigrations.migrate(row.payload)`),
  not in bulk.

### Reading and writing

Read on hydration, dispatch into the slice:

```ts
const completedSessions = (await db.select().from(sessionsSchema)).reduce(
  toRecord(
    (x) => x.id,
    (row) => Session.fromJSON(sessionMigrations.migrate(row.payload)),
  ),
  {},
);
dispatch(setStoredSessions(completedSessions));
```

Write with the `upsert` helper in `app/src/db/helpers.ts`, which does an
`insert … onConflictDoUpdate` on the id - the right call for our id+payload tables, and it takes a
transaction (`tx`) as well as `db`:

```ts
await upsert(db, feedSentReactionsSchema, [
  { id: action.payload.id, payload: action.payload.toJSON() },
]);
```

Use `db.transaction(async (tx) => …)` when several tables must move together.

### Testing

Effects that touch the DB use a real in-memory SQLite rather than a mock - `openDatabaseAsync(':memory:')`,
`drizzle(...)`, then `DatabaseMigrationService.migrate()` to build the schema. See
`app/src/store/program/effects.spec.ts` for the pattern and `utils/__test__/add-effect-testbed` for
wiring effects to a test store.

## Which one do I use?

Use **preferences** for a single scalar the user sets and the app reads - a toggle, a colour, a token, a
timestamp. Use **SQLite** for anything the user creates in quantity, anything queried or deleted by id,
and anything that needs to survive versioned shape changes.

Startup order is `initializeSettingsStateSlice` → (once settings are hydrated)
`initializeStoredSessionsStateSlice`. Preferences are therefore available to DB hydration, but not the
other way round; `stored-sessions/effects.ts` asserts this explicitly.

## Sessions, and the one in progress

`storedSessions.sessions` holds every session the user owns - their history *and* the workout in
progress - keyed by id, with `activeSessionId` pointing at the live one. Screens address a session by
id (`updateStoredSession({ sessionId, update })`, mirroring `updateProgram`), so two screens editing
different sessions cannot collide.

Two things follow from that, and both matter when you touch this slice:

- **Editing a session must not re-run every aggregate.** Streak, personal records, volume scales, the
  month list and the "previous performances" lookup all sweep the whole history, and screens that
  subscribe to them stay mounted while you edit - the History tab sits behind the workout screen, and
  the History list sits behind `/history/edit`. Three things keep an edit off that path, and all three
  matter:
  - `selectSessions` returns only *finished* sessions, so the workout in progress cannot move it.
  - `selectRecentlyCompletedExercises(state, sessionId)` additionally drops the session being viewed,
    which is both what "previous" means and what makes editing a history session cheap.
  - Both memoize with `resultEqualityCheck: shallowEqual`. The underlying map changes identity on every
    recorded set, so the filter re-runs; handing back the previous array is what stops everything
    downstream from recomputing.

  Use `selectSession(state, id)` to look up a session by id, active or not, and `selectActiveSession`
  for the live workout.
- `useAppSelectorWhenFocused` (`store/index.ts`) does not run its selector at all while the screen is
  offscreen - it is the tool for an expensive selector on a screen that stays mounted underneath
  another. It returns the last value it saw until focus comes back.
- `putStoredSession` / `updateStoredSession` mean "this session changed" and only write the payload.
  `sessionFinished` means "the user is done with it" and is what queues the feed publish, exports to the
  health aggregator, marks stats dirty and clears the active pointer. Keep completion work on the
  latter, or it fires once per set.

The `active` column has a single writer, the `setActiveSessionId` effect, in a transaction with a unique
partial index (`single_active_session`) enforcing at most one - the same shape the `program` table uses
for the active plan.

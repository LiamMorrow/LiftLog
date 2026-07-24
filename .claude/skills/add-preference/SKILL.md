---
name: add-preference
description: >-
  Use when adding, removing, or changing a user preference / app setting — anything that lives in the
  settings Redux slice and persists via PreferenceService (a toggle, a chosen value, a token, a
  timestamp). Covers the five places that must change together, the two-defaults trap, the isHydrated
  write guard, and why preferences are excluded from backups.
---

# Adding a preference

A preference is a small, single value the user sets and the app reads — a toggle, a colour, a token, a
timestamp. It lives in the settings slice at runtime and persists through `PreferenceService`, which
writes one file per key. Full reference: `docs/Storage.md`.

**Not every persisted value belongs here.** Anything the user creates in quantity, anything queried or
deleted by id, and anything that must survive a backup/restore belongs in SQLite instead — see
`docs/Storage.md` and the `add-storage-migration` skill.

## The five places that change together

Adding a preference touches five files. Miss one and it silently doesn't persist, or doesn't hydrate.

1. **`app/src/services/preference-service.ts`** — a `get…`/`set…` pair. The getter supplies the default
   for the never-written case:

   ```ts
   async getShowPostWorkoutSummary(): Promise<boolean> {
     const value = await this.keyValueStore.getItem('showPostWorkoutSummary');
     return fromBooleanString(value, false);
   }

   async setShowPostWorkoutSummary(value: boolean): Promise<void> {
     await this.keyValueStore.setItem('showPostWorkoutSummary', toBooleanString(value));
   }
   ```

   Everything on disk is a string. Booleans use `toBooleanString`/`fromBooleanString` (`'True'` /
   `'False'` — the casing is historical, don't "fix" it). Non-primitives get an explicit parse with a
   fallback; see `getColorSchemeSeed` (regex-validated `ts-pattern` match) and `getFirstDayOfWeek`.

2. **`app/src/store/settings/index.ts`** — add the field to `SettingsState`, a value to `initialState`,
   and a `setYourThing` reducer + export.

3. **`app/src/store/settings/effects.ts` — hydrate.** Add `preferenceService.getYourThing()` to the
   `Promise.all` in the `initializeSettingsStateSlice` effect, destructure it, and `dispatch(setYourThing(…))`.

4. **`app/src/store/settings/effects.ts` — persist.** Add the write-back effect:

   ```ts
   addEffect(setYourThing, async (action, { stateAfterReduce, extra: { preferenceService } }) => {
     if (stateAfterReduce.settings.isHydrated) {
       await preferenceService.setYourThing(action.payload);
     }
   });
   ```

   **The `isHydrated` guard is mandatory.** Without it, the hydration dispatches in step 3 immediately
   write back what they just read — noisy at best, and it defeats any later change to the stored default.

5. **The settings UI** — usually a `ListSwitch` in `app/src/app/(tabs)/settings/app-configuration.tsx`,
   reading `useAppSelector((state: RootState) => state.settings)` and dispatching the action. Labels are
   Tolgee keys (`<T keyName="…" />`); add `<area>.<thing>.label` and `.subtitle` to
   `app/src/i18n/en.json` only — other languages come from Weblate. See `app/src/i18n/README.md` for the
   key naming rules.

## Traps

- **Two defaults, and they can disagree.** `initialState` in the slice is what the app shows *before*
  hydration; the `PreferenceService` getter default is what the user actually ends up with. Set both to
  the same value unless you deliberately want a different pre-hydration appearance. (Some existing
  entries disagree — that's drift, not a pattern to copy.)
- **The getter default *is* the migration story.** There is no migration chain for preferences. Changing
  the encoding of an existing key means the getter must still read the old form — see
  `getPreferredLanguage`, which rewrites the legacy `zh_Hans` value on read.
- **Preferences are not backed up.** `getBackupBytes` serializes the SQLite database only, so a preference
  does not survive export/restore or remote backup. If the user would be upset to lose it on a device
  switch, it belongs in the DB.
- **Don't read preferences from components.** Components read `state.settings`; only effects touch
  `preferenceService`. The sole sanctioned sync read is `getItemSync` for values needed before the store
  exists (language, for Tolgee).
- **`setProToken` no-ops in `__DEV__`.** Expected, not a bug.

## Removing a preference

Delete all five pieces, and don't bother deleting the on-disk file — an orphaned key in the document
directory is harmless and cheaper than a cleanup path.

## Verify

From `app/`: `npm run typecheck`, then `npm run lint`. A straight round-trip preference needs no test;
if it drives behaviour elsewhere, test that. `app/src/store/settings/` has specs for the backup/export
effects to copy the setup from, and `utils/__test__/add-effect-testbed` wires effects to a test store.

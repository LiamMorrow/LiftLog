---
name: add-setting-or-preference
description: >-
  Use when adding, removing, or changing a user setting / app preference - anything that lives in the
  settings Redux slice and persists via PreferenceService (a toggle, a chosen value, a token, a
  timestamp). Covers the single registry entry that drives everything, choosing a codec, the
  persist/hydrate escape hatches for bespoke keys, and why preferences are excluded from backups.
---

# Adding a setting or preference

A preference is a small, single value the user sets and the app reads - a toggle, a colour, a token, a
timestamp. It lives in the settings slice at runtime and persists through `PreferenceService`, which
writes one file per key. Full reference: `docs/Storage.md`.

**Not every persisted value belongs here.** Anything the user creates in quantity, anything queried or
deleted by id, and anything that must survive a backup/restore belongs in SQLite instead - see
`docs/Storage.md` and the `add-storage-migration` skill.

## The one place that changes: the registry

Add a single entry to `preferenceRegistry` in `app/src/store/settings/registry.ts`:

```ts
export const preferenceRegistry = {
  // …
  showPostWorkoutSummary: pref({ default: false, codec: boolCodec }),
} satisfies Record<string, PrefDescriptor<unknown>>;
```

From that one entry the system derives, automatically:

- the `SettingsState` field and its type,
- the `initialState` default,
- a typed action creator named `setShowPostWorkoutSummary` (the historical `set<Capitalize<key>>`
  name), reduced by a single matcher,
- generic hydration (read on launch) and generic persistence (write-back on change, guarded by
  `isHydrated`).

Then do the two things that can't be derived:

1. **Re-export the setter.** ESM can't spread named exports, so add `setShowPostWorkoutSummary` to the
   destructured `export const { … } = preferenceSetters;` list in `app/src/store/settings/index.ts`.
   This is compiler-enforced - omit it and the call sites fail to typecheck.
2. **The settings UI** - usually a `ListSwitch` in `app/src/app/(tabs)/settings/app-configuration.tsx`,
   reading `useAppSelector((state: RootState) => state.settings)` and dispatching the action. Labels are
   Tolgee keys (`<T keyName="…" />`); add `<area>.<thing>.label` and `.subtitle` to
   `app/src/i18n/en.json` only - other languages come from Weblate. See `app/src/i18n/README.md`.

That's it - no `PreferenceService` method, no hydration wiring, no per-key write-back effect.

## Choosing a codec

The codec (in `app/src/store/settings/codecs.ts`) maps the value to/from its on-disk string. `deserialize`
returns `undefined` for an absent/unparseable key (the descriptor `default` then wins); `serialize`
returns `undefined` to remove the key. Reuse an existing one where possible:

- `boolCodec` - `'True'` / `'False'` (historical casing, don't "fix" it).
- `intCodec` - `parseInt`, falls back to the default on `NaN`.
- `stringCodec` - passthrough; an `undefined` value removes the key.
- `colorSchemeSeedCodec`, `dayOfWeekCodec`, `instantCodec` - worked examples of validated / typed values.

For a new value shape, add a `Codec<T>` next to these. The codec owns the encoding **and** the
back-compat story: if you change how an existing key is stored, its `deserialize` must still read the
old form (see `getPreferredLanguage`, which rewrites the legacy `zh_Hans` value on read).

## Escape hatches for bespoke keys

Most keys need nothing beyond `{ default, codec }`. A `PrefDescriptor` also accepts:

- `persist: false` - the generic write-back skips the key; a dedicated effect in
  `app/src/store/settings/effects.ts` owns saving it. Use for permission gates (`exportToHealthAggregator`),
  dev-only guards (`proToken`), or values spread across several storage keys (`remoteBackupSettings`).
- `hydrate: 'manual'` - the init effect reads the key explicitly instead of the generic loop. Use for
  sync reads, composite keys, or values composed from multiple keys (`lastBackup`).
- `sync: true` - read via `getItemSync` during hydration (`preferredLanguage`, needed before the store
  exists for Tolgee).
- `storageKey` - override the on-disk key name (defaults to the registry key).

A bespoke key with no `codec` (e.g. `remoteBackupSettings`, `lastBackup`) is state-only from the
registry's view: keep its custom get/set methods on `PreferenceService` and wire its hydrate/persist by
hand in `effects.ts`.

## Traps

- **One default, one source.** The default lives only in the descriptor, so the pre-hydration value and
  the never-written value can no longer drift apart (they used to).
- **Preferences are not backed up.** `getBackupBytes` serializes the SQLite database only, so a preference
  does not survive export/restore or remote backup. If the user would be upset to lose it on a device
  switch, it belongs in the DB.
- **Don't read preferences from components.** Components read `state.settings`; only effects touch
  `preferenceService`. The sanctioned reads outside effects are `getPreference` in data-migrations and the
  sync `getPreferredLanguage` for Tolgee.
- **`setProToken` no-ops in `__DEV__`.** Expected, not a bug - that's why it's a bespoke `persist: false`
  key rather than a generic one.

## Removing a preference

Delete the registry entry and its re-export line (typecheck will point at any remaining call sites), plus
its UI. Don't bother deleting the on-disk file - an orphaned key in the document directory is harmless.

## Verify

From `app/`: `npm run typecheck`, then `npm run lint`. `app/src/services/preference-service.spec.ts`
characterizes the storage encodings and `app/src/store/settings/preferences.spec.ts` covers the generated
action + generic hydrate/persist - extend them if you add a new codec or a bespoke key. A straight
round-trip preference otherwise needs no new test; if it drives behaviour elsewhere, test that.

# Exercise catalog overlays

The base catalog lives one level up in `assets/exercises.json`: the language-neutral data for each
built-in exercise — its **English name** (the stable id) plus fixed-vocabulary metadata (muscles,
category, equipment, …, localized via Tolgee keys). It holds no free-text translated fields.

Each `<locale>.json` here is a read-only overlay onto that base, keyed by the English name, holding the
translated free-text fields:

```json
{
  "3/4 Sit-Up": { "name": "…", "instructions": "…\n…" }
}
```

`en.json` is the English overlay, the **Weblate source catalog** other locales are translated from, and
always the fallback layer under the active locale. Missing files, keys, or fields fall back to English.

## Adding / updating a locale

Translations are managed in Weblate at https://translate.liftlog.online

When adding a new locale, ensure to add the loader to the `localeLoaders` function in the `exercise-catalog.ts`

See `assets/sources.txt` for the source of each locale.

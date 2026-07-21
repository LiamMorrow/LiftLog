import { ExerciseDescriptor } from '@/models/exercise-models';
import { detectLanguageFromDateLocale } from '@/utils/language-detector';
import { supportedLanguages } from '@/services/tolgee';

// The language-neutral base catalog: the id (English name) plus the fixed-vocabulary metadata
// (localized via Tolgee keys at display time). The translated free-text fields live in the overlays.
export interface BuiltInExerciseJSON {
  name: string;
  force: string | null;
  level: string;
  mechanic: string | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  category: string;
}

// A locale overlay, keyed by English name, holding the translated free-text fields. Instructions are a
// single newline-separated string. English (en.json) is itself an overlay carrying these fields.
export interface ExerciseTranslation {
  name?: string;
  instructions?: string;
}
export type ExerciseTranslationMap = Record<string, ExerciseTranslation | undefined>;

function builtInToDescriptor(
  json: BuiltInExerciseJSON,
  translation: ExerciseTranslation | undefined,
): ExerciseDescriptor {
  return {
    name: translation?.name ?? json.name,
    force: json.force,
    level: json.level,
    mechanic: json.mechanic,
    equipment: json.equipment,
    category: json.category,
    instructions: translation?.instructions ?? '',
    muscles: json.primaryMuscles.concat(json.secondaryMuscles),
  };
}

/** Overlays a locale's translations onto the base catalog, keyed by English name, per-field fallback. */
export function resolveCatalog(
  base: BuiltInExerciseJSON[],
  translations: ExerciseTranslationMap,
): Record<string, ExerciseDescriptor> {
  const result: Record<string, ExerciseDescriptor> = {};
  for (const exercise of base) {
    result[exercise.name] = builtInToDescriptor(exercise, translations[exercise.name]);
  }
  return result;
}

// English is the fallback overlay, always layered under the active locale. Every other supported locale
// has an overlay too (empty until translated in Weblate); missing keys fall back to English.
const englishLoader = () => import('../../assets/exercises/en.json');
const localeLoaders: Record<string, () => Promise<{ default: ExerciseTranslationMap }>> = {
  ar: () => import('../../assets/exercises/ar.json'),
  cs: () => import('../../assets/exercises/cs.json'),
  de: () => import('../../assets/exercises/de.json'),
  es: () => import('../../assets/exercises/es.json'),
  fi: () => import('../../assets/exercises/fi.json'),
  fr: () => import('../../assets/exercises/fr.json'),
  hu: () => import('../../assets/exercises/hu.json'),
  it: () => import('../../assets/exercises/it.json'),
  ko: () => import('../../assets/exercises/ko.json'),
  nl: () => import('../../assets/exercises/nl.json'),
  pl: () => import('../../assets/exercises/pl.json'),
  pt: () => import('../../assets/exercises/pt.json'),
  ru: () => import('../../assets/exercises/ru.json'),
  sr: () => import('../../assets/exercises/sr.json'),
  sv: () => import('../../assets/exercises/sv.json'),
  tr: () => import('../../assets/exercises/tr.json'),
  uk: () => import('../../assets/exercises/uk.json'),
  'zh-hans': () => import('../../assets/exercises/zh-hans.json'),
};

async function loadBaseCatalog(): Promise<BuiltInExerciseJSON[]> {
  const { exercises } = await import('../../assets/exercises.json');
  return exercises as BuiltInExerciseJSON[];
}

async function loadEnglishOverlay(): Promise<ExerciseTranslationMap> {
  return (await englishLoader()).default;
}

const baseLanguage = (locale: string) => locale.toLowerCase().split('-')[0]!;

// Best-effort: an exact match, then a shared base language (so "ru-RU" or "ru" both hit the "ru" file).
function matchLoader(locale: string): string | undefined {
  const lower = locale.toLowerCase();
  if (localeLoaders[lower]) {
    return lower;
  }
  const base = baseLanguage(locale);
  return Object.keys(localeLoaders).find((code) => baseLanguage(code) === base);
}

// An unset preference means "system default", so resolve the same locale the UI displays.
function resolveLocale(preferredLanguage: string | undefined): string {
  return preferredLanguage ?? detectLanguageFromDateLocale(supportedLanguages.map((x) => x.code));
}

async function loadTranslations(preferredLanguage: string | undefined): Promise<ExerciseTranslationMap> {
  const code = matchLoader(resolveLocale(preferredLanguage));
  const localePromise: Promise<ExerciseTranslationMap> = code
    ? localeLoaders[code]!().then((m) => m.default)
    : Promise.resolve({});
  const [english, locale] = await Promise.all([loadEnglishOverlay(), localePromise]);
  const merged: ExerciseTranslationMap = { ...english };
  for (const [id, translation] of Object.entries(locale)) {
    merged[id] = {
      name: translation?.name ?? english[id]?.name,
      instructions: translation?.instructions ?? english[id]?.instructions,
    };
  }
  return merged;
}

/**
 * The read-only built-in exercise catalog resolved for a locale, keyed by the exercise's English name
 * (its stable id). An unset language falls back to the system default; missing files or keys fall back
 * to English.
 */
export async function loadBuiltInExercises(
  preferredLanguage: string | undefined,
): Promise<Record<string, ExerciseDescriptor>> {
  const [base, translations] = await Promise.all([loadBaseCatalog(), loadTranslations(preferredLanguage)]);
  return resolveCatalog(base, translations);
}

/** The canonical English built-in ids and descriptors, used by the de-dup data migration. */
export async function loadCanonicalBuiltInExercises(): Promise<Record<string, ExerciseDescriptor>> {
  const [base, english] = await Promise.all([loadBaseCatalog(), loadEnglishOverlay()]);
  return resolveCatalog(base, english);
}

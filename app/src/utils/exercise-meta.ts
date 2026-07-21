import { useTranslate } from '@tolgee/react';
import type { TranslationKey } from '@tolgee/web';

type TranslateFn = ReturnType<typeof useTranslate>['t'];

export type ExerciseMetaKind = 'muscle' | 'category' | 'equipment' | 'force' | 'level' | 'mechanic';

function toKeySegment(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Localizes a built-in exercise's fixed-vocabulary metadata (muscles, category, etc.) via Tolgee keys.
 * Values outside the known vocabulary (e.g. a user-typed muscle) fall back to the raw string.
 */
export function translateExerciseMeta(t: TranslateFn, kind: ExerciseMetaKind, value: string): string {
  if (!value) {
    return value;
  }
  const key = `exercise.${kind}.${toKeySegment(value)}` as TranslationKey;
  return t(key, value);
}

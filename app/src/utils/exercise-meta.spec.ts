import { describe, expect, it, vi } from 'vitest';
import { translateExerciseMeta } from '@/utils/exercise-meta';

// Stubs Tolgee's t: returns the mapped translation, else the provided default (raw value).
function makeT(translations: Record<string, string>) {
  return vi.fn((key: string, defaultValue: string) => translations[key] ?? defaultValue) as never;
}

describe('translateExerciseMeta', () => {
  it('normalizes the value to a key and returns the translation', () => {
    const t = makeT({ 'exercise.muscle.lower_back': 'Bas du dos' });
    expect(translateExerciseMeta(t, 'muscle', 'lower back')).toBe('Bas du dos');
  });

  it('normalizes punctuation and casing', () => {
    const t = makeT({ 'exercise.equipment.e_z_curl_bar': 'Barre EZ' });
    expect(translateExerciseMeta(t, 'equipment', 'E-Z Curl Bar')).toBe('Barre EZ');
  });

  it('falls back to the raw value for an unknown vocabulary entry', () => {
    const t = makeT({});
    expect(translateExerciseMeta(t, 'muscle', 'custom muscle')).toBe('custom muscle');
  });

  it('returns empty input unchanged', () => {
    const t = makeT({});
    expect(translateExerciseMeta(t, 'category', '')).toBe('');
  });
});

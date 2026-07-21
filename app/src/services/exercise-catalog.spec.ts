import { describe, expect, it } from 'vitest';
import { BuiltInExerciseJSON, loadBuiltInExercises, resolveCatalog } from '@/services/exercise-catalog';

const baseSample: BuiltInExerciseJSON[] = [
  {
    name: 'Squat',
    force: 'push',
    level: 'beginner',
    mechanic: 'compound',
    equipment: 'barbell',
    primaryMuscles: ['quadriceps'],
    secondaryMuscles: ['glutes'],
    category: 'strength',
  },
];

describe('resolveCatalog', () => {
  it('takes name from the id and joins the overlay instructions, merging muscles from the base', () => {
    const catalog = resolveCatalog(baseSample, { Squat: { instructions: ['Stand up', 'Sit down'] } });
    expect(catalog['Squat']).toMatchObject({
      name: 'Squat',
      instructions: 'Stand up\nSit down',
      muscles: ['quadriceps', 'glutes'],
    });
  });

  it('overlays a translated name and instructions, keyed by the English name', () => {
    const catalog = resolveCatalog(baseSample, {
      Squat: { name: 'Приседания', instructions: ['Встать', 'Сесть'] },
    });
    expect(catalog['Squat']!.name).toBe('Приседания');
    expect(catalog['Squat']!.instructions).toBe('Встать\nСесть');
  });

  it('falls back to the id name when an overlay omits the name', () => {
    const catalog = resolveCatalog(baseSample, { Squat: { instructions: ['Встать'] } });
    expect(catalog['Squat']!.name).toBe('Squat');
    expect(catalog['Squat']!.instructions).toBe('Встать');
  });
});

describe('loadBuiltInExercises', () => {
  it('loads the real base catalog with the English overlay for an unknown locale', async () => {
    const catalog = await loadBuiltInExercises('xx-unknown');
    expect(Object.keys(catalog).length).toBeGreaterThan(100);
    expect(catalog['3/4 Sit-Up']!.name).toBe('3/4 Sit-Up');
    // instructions come from the always-applied en.json overlay
    expect(catalog['3/4 Sit-Up']!.instructions.length).toBeGreaterThan(0);
  });

  it('overlays the bundled Russian translations', async () => {
    const [english, russian] = await Promise.all([loadBuiltInExercises('en'), loadBuiltInExercises('ru')]);
    expect(Object.keys(russian)).toEqual(Object.keys(english));
    expect(russian['Barbell Squat']!.name).not.toBe(english['Barbell Squat']!.name);
    expect(russian['Barbell Squat']!.name.length).toBeGreaterThan(0);
  });

  it('best-effort matches a region variant to the base language file', async () => {
    const [russian, regionVariant] = await Promise.all([loadBuiltInExercises('ru'), loadBuiltInExercises('ru-RU')]);
    expect(regionVariant['Barbell Squat']!.name).toBe(russian['Barbell Squat']!.name);
  });

  it('falls back to English for a locale whose overlay is still empty', async () => {
    const [english, german] = await Promise.all([loadBuiltInExercises('en'), loadBuiltInExercises('de')]);
    expect(german['Barbell Squat']!.name).toBe(english['Barbell Squat']!.name);
    expect(german['Barbell Squat']!.instructions).toBe(english['Barbell Squat']!.instructions);
    expect(german['Barbell Squat']!.instructions.length).toBeGreaterThan(0);
  });
});

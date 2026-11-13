import { describe, expect, it } from 'vitest';
import { ExerciseDescriptor } from '@/models/exercise-models';
import { resolveExerciseVariation } from './exercise-variation';

const source: ExerciseDescriptor = {
  name: 'Split Squats',
  force: 'push',
  level: 'beginner',
  mechanic: 'compound',
  equipment: 'dumbbell',
  muscles: ['quadriceps'],
  secondaryMuscles: ['glutes'],
  instructions: 'Repeat on the other side.',
  category: 'strength',
};

describe('resolveExerciseVariation', () => {
  it('reuses the original catalogue entry when no variation is chosen', () => {
    const result = resolveExerciseVariation(source, '', { original: source });
    expect(result).toEqual({ exercise: source, isNew: false });
    expect(result.exercise).toBe(source);
  });

  it.each(['Left', 'Right', 'Rear foot elevated'])('copies the descriptor with a %s suffix', (variation) => {
    const result = resolveExerciseVariation(source, variation, { original: source });
    expect(result).toEqual({ exercise: { ...source, name: `Split Squats (${variation})` }, isNew: true });
    expect(source.name).toBe('Split Squats');
  });

  it('trims custom variation text', () => {
    expect(resolveExerciseVariation(source, '  Bent knee  ', {}).exercise.name).toBe('Split Squats (Bent knee)');
  });

  it('does not append a suffix for whitespace-only text', () => {
    expect(resolveExerciseVariation(source, '  ', {}).exercise.name).toBe('Split Squats');
  });

  it('reuses an existing variation, including its edited metadata', () => {
    const existing = { ...source, name: 'split squats (left)', instructions: 'My instructions' };
    const result = resolveExerciseVariation(source, 'Left', { existing });
    expect(result.isNew).toBe(false);
    expect(result.exercise).toBe(existing);
  });

  it('does not conflate similarly named movements', () => {
    const existing = { ...source, name: 'Split Squat (Left)' };
    expect(resolveExerciseVariation(source, 'Left', { existing }).isNew).toBe(true);
  });

  it('keeps existing parenthetical descriptions intact', () => {
    expect(resolveExerciseVariation({ ...source, name: 'Front Squat (Clean Grip)' }, 'Right', {}).exercise.name).toBe(
      'Front Squat (Clean Grip) (Right)',
    );
  });

  it('saves a new custom exercise unchanged when no variation is chosen', () => {
    expect(resolveExerciseVariation(source, '', {})).toEqual({ exercise: source, isNew: true });
  });
});

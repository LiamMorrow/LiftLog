import { BuiltInPrograms } from '@/models/built-in-programs';
import { WeightedExerciseBlueprint } from '@/models/blueprint-models';
import { describe, expect, it } from 'vitest';

describe('built-in-programs', () => {
  it('exposes every shipped program', () => {
    expect(Object.keys(BuiltInPrograms)).toHaveLength(7);
  });

  it.each(Object.entries(BuiltInPrograms))('%s migrates to a stable weighted shape', (_id, program) => {
    const weighted = program.sessions.flatMap((session) =>
      session.exercises.filter((e): e is WeightedExerciseBlueprint => e.type === 'WeightedExerciseBlueprint'),
    );

    expect(
      weighted.map((exercise) => ({
        name: exercise.name,
        sets: exercise.sets,
        repsConfig: exercise.repsConfig,
        usesBodyweight: exercise.usesBodyweight,
        progressiveOverload: exercise.progressiveOverload.toJSON(),
        progressionKey: exercise.progressionKey(),
      })),
    ).toMatchSnapshot();
  });
});

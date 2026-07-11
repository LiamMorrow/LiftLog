import { describe, it, expect } from 'vitest';
import { validateLatestProgramBlueprint } from '@/models/storage/versions/latest/validate-blueprint';
import type { ProgramBlueprintJSON } from '@/models/storage/versions/latest/blueprint';
import type { BigNumberJSON, DurationJSON, LocalDateJSON } from '@/models/storage/versions/libs';

const validBlueprint: ProgramBlueprintJSON = {
  version: 2,
  name: 'Test Plan',
  lastEdited: '2024-01-01' as LocalDateJSON,
  sessions: [
    {
      version: 2,
      name: 'Day 1',
      notes: '',
      exercises: [
        {
          type: 'WeightedExerciseBlueprint',
          name: 'Squat',
          sets: 3,
          repsPerSet: 5,
          restBetweenSets: {
            minRest: 'PT1M' as DurationJSON,
            maxRest: 'PT3M' as DurationJSON,
            failureRest: 'PT5M' as DurationJSON,
          },
          supersetWithNext: false,
          notes: '',
          link: '',
          progressiveOverload: { type: 'IncreaseAllEvenlyProgressiveOverload', amount: '2.5' as BigNumberJSON },
        },
      ],
    },
  ],
};

describe('validateLatestProgramBlueprint', () => {
  it('accepts a valid latest blueprint', () => {
    expect(validateLatestProgramBlueprint(validBlueprint).ok).toBe(true);
  });

  it('rejects a blueprint missing a required field, with a message', () => {
    const { version: _version, ...withoutVersion } = validBlueprint;
    const result = validateLatestProgramBlueprint(withoutVersion);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.length).toBeGreaterThan(0);
    }
  });

  it('rejects an unknown exercise type', () => {
    const bad = {
      ...validBlueprint,
      sessions: [{ ...validBlueprint.sessions[0]!, exercises: [{ type: 'NotARealExercise' }] }],
    };
    expect(validateLatestProgramBlueprint(bad).ok).toBe(false);
  });
});

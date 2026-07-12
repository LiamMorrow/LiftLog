import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ProgramBlueprint } from '@/models/blueprint-models';
import { parseProgramBlueprintFile, serializeProgramBlueprint } from '@/models/plan-file';
import type { ProgramBlueprintJSON } from '@/models/storage/versions/latest/blueprint';
import type { ProgramBlueprintJSON as InitialProgramBlueprintJSON } from '@/models/storage/versions/initial';
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

const encode = (value: unknown) => new TextEncoder().encode(JSON.stringify(value));

describe('plan-file', () => {
  it('round-trips a blueprint through serialize and parse', () => {
    const blueprint = ProgramBlueprint.fromJSON(validBlueprint);
    const result = parseProgramBlueprintFile(serializeProgramBlueprint(blueprint));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.blueprint.toJSON()).toEqual(validBlueprint);
    }
  });

  it('rejects a file that is not valid JSON', () => {
    const result = parseProgramBlueprintFile(new TextEncoder().encode('not json'));
    expect(result.ok).toBe(false);
  });

  it('migrates a legacy (v1) plan file to the latest version', () => {
    const v1: InitialProgramBlueprintJSON = {
      name: 'Legacy Plan',
      lastEdited: '2020-06-01' as LocalDateJSON,
      sessions: [
        {
          name: 'Day 1',
          notes: '',
          exercises: [
            {
              type: 'WeightedExerciseBlueprint',
              name: 'Bench',
              sets: 3,
              repsPerSet: 5,
              weightIncreaseOnSuccess: '2.5' as BigNumberJSON,
              restBetweenSets: {
                minRest: 'PT1M' as DurationJSON,
                maxRest: 'PT3M' as DurationJSON,
                failureRest: 'PT5M' as DurationJSON,
              },
              supersetWithNext: false,
              notes: '',
              link: '',
            },
          ],
        },
      ],
    };
    const result = parseProgramBlueprintFile(encode(v1));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.blueprint.name).toBe('Legacy Plan');
      expect(result.blueprint.sessions[0]!.exercises[0]!.name).toBe('Bench');
    }
  });

  it('rejects a plan whose shape does not match the schema', () => {
    const result = parseProgramBlueprintFile(encode({ version: 2, name: 'Broken', sessions: 'nope' }));
    expect(result.ok).toBe(false);
  });

  // The plan-builder skill publishes these as the reference for anyone authoring
  // a plan by hand or with an AI, so they have to survive the real import path.
  it.each(['push-pull-legs', 'couch-to-5k'])('imports the published %s example', (name) => {
    const path = join(
      __dirname,
      `../../../plugins/liftlog-plan-builder/skills/create-liftlog-plan/examples/${name}.liftlogplan`,
    );
    const result = parseProgramBlueprintFile(readFileSync(path));
    expect(result.ok).toBe(true);
  });
});

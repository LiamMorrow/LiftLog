import { describe, expect, it } from 'vitest';
import { Duration, LocalDate } from '@js-joda/core';
import BigNumber from 'bignumber.js';
import { aiPlanFromJSON } from '@/models/ai-models';
import {
  CardioExerciseBlueprint,
  CardioExerciseSetBlueprint,
  IncreaseAllEvenlyProgressiveOverload,
  IncreaseLowestSetProgressiveOverload,
  NoProgressiveOverload,
  ProgramBlueprint,
  Rest,
  SessionBlueprint,
  WeightedExerciseBlueprint,
} from '@/models/blueprint-models';
import { AnyVersionAiPlanJSON } from '@/models/storage/versions/any';
import { WeightedExerciseBlueprintJSON } from '@/models/storage/versions/latest';
import { toBigNumberJSON, toDurationJSON, toLocalDateJSON } from '@/models/storage/versions/libs';
import { DeepPartial } from '@/utils/types';

function parse(json: DeepPartial<AnyVersionAiPlanJSON>) {
  return aiPlanFromJSON(json);
}

function firstSession(json: DeepPartial<AnyVersionAiPlanJSON>) {
  return parse(json).blueprint.sessions[0]!;
}

function firstExercise(json: DeepPartial<AnyVersionAiPlanJSON>) {
  return firstSession(json).exercises[0]!;
}

describe('aiPlanFromJSON', () => {
  it('throws when the wire plan has no version', () => {
    expect(() => parse({})).toThrow();
  });

  it('passes a complete plan through untouched (only re-stamping lastEdited)', () => {
    const weighted = new WeightedExerciseBlueprint(
      'Squat',
      5,
      { type: 'fixed', reps: 5 },
      new IncreaseLowestSetProgressiveOverload(new BigNumber(2.5), 'middle'),
      Rest.long,
      true,
      'Brace hard',
      'https://example.com/squat',
    );
    const cardio = new CardioExerciseBlueprint(
      'Row',
      [
        new CardioExerciseSetBlueprint(
          {
            type: 'distance',
            value: { value: new BigNumber(2), unit: 'mile' },
          },
          true,
          true,
          true,
          true,
          true,
          true,
          undefined,
        ),
      ],
      'Steady pace',
      'https://example.com/row',
    );
    const blueprint = new ProgramBlueprint(
      'My Program',
      [new SessionBlueprint('Day 1', [weighted, cardio], 'Heavy day')],
      LocalDate.of(2020, 1, 1),
    );

    const result = parse({
      version: 3,
      name: 'Strength',
      description: 'A complete plan',
      blueprint: blueprint.toJSON(),
    });

    expect(result.name).toBe('Strength');
    expect(result.description).toBe('A complete plan');
    expect(result.blueprint.toJSON()).toEqual({
      ...blueprint.toJSON(),
      lastEdited: toLocalDateJSON(LocalDate.now()),
    });
  });

  describe('top-level fields', () => {
    it('fills empty description and blueprint when only a name streamed in', () => {
      const plan = parse({ version: 3, name: 'here' });

      expect(plan.name).toBe('here');
      expect(plan.description).toBe('');
      expect(plan.blueprint.name).toBe('');
      expect(plan.blueprint.sessions).toEqual([]);
    });

    it('always stamps the blueprint as last edited today', () => {
      const plan = parse({ version: 3, name: 'here' });

      expect(plan.blueprint.lastEdited.equals(LocalDate.now())).toBe(true);
    });

    it('keeps the provided name and description', () => {
      const plan = parse({
        version: 3,
        name: 'PPL',
        description: 'Push pull legs',
      });

      expect(plan.name).toBe('PPL');
      expect(plan.description).toBe('Push pull legs');
    });
  });

  describe('sessions', () => {
    it('fills missing exercises and notes on a session', () => {
      const session = firstSession({
        version: 3,
        name: 'PPL',
        blueprint: { sessions: [{ name: 'Day 1' }] },
      });

      expect(session.name).toBe('Day 1');
      expect(session.exercises).toEqual([]);
      expect(session.notes).toBe('');
    });

    it('fills every session in the array', () => {
      const plan = parse({
        version: 3,
        name: 'PPL',
        blueprint: { sessions: [{ name: 'Day 1' }, { name: 'Day 2' }] },
      });

      expect(plan.blueprint.sessions.map((s) => s.name)).toEqual(['Day 1', 'Day 2']);
    });
  });

  describe('weighted exercises', () => {
    it('defaults an exercise with no type to a weighted exercise', () => {
      const exercise = firstExercise({
        version: 3,
        name: 'PPL',
        blueprint: { sessions: [{ exercises: [{ name: 'Bench' }] }] },
      });

      expect(exercise).toBeInstanceOf(WeightedExerciseBlueprint);
    });

    it('falls back to the empty weighted defaults for absent fields', () => {
      const exercise = firstExercise({
        version: 3,
        name: 'PPL',
        blueprint: { sessions: [{ exercises: [{ name: 'Bench' }] }] },
      }) as WeightedExerciseBlueprint;

      const empty = WeightedExerciseBlueprint.empty();
      expect(exercise.name).toBe('Bench');
      expect(exercise.sets).toBe(empty.sets);
      expect(exercise.repsConfig).toEqual(empty.repsConfig);
      expect(exercise.supersetWithNext).toBe(false);
      expect(exercise.notes).toBe('');
      expect(exercise.link).toBe('');
      expect(exercise.progressiveOverload).toBeInstanceOf(NoProgressiveOverload);
      expect(exercise.restBetweenSets.minRest.equals(Rest.medium.minRest)).toBe(true);
    });

    it('fills only the missing parts of rest', () => {
      const exercise = firstExercise({
        version: 3,
        name: 'PPL',
        blueprint: {
          sessions: [
            {
              exercises: [
                {
                  type: 'WeightedExerciseBlueprint',
                  restBetweenSets: {
                    minRest: toDurationJSON(Duration.ofSeconds(45)),
                  },
                },
              ],
            },
          ],
        },
      }) as WeightedExerciseBlueprint;

      expect(exercise.restBetweenSets.minRest.equals(Duration.ofSeconds(45))).toBe(true);
      expect(exercise.restBetweenSets.maxRest.equals(Rest.medium.maxRest)).toBe(true);
      expect(exercise.restBetweenSets.failureRest.equals(Rest.medium.failureRest)).toBe(true);
    });

    it('keeps every field of a fully specified weighted exercise', () => {
      const exercise = firstExercise({
        version: 3,
        name: 'PPL',
        blueprint: {
          sessions: [
            {
              exercises: [
                {
                  type: 'WeightedExerciseBlueprint',
                  name: 'Squat',
                  sets: 5,
                  repsConfig: { type: 'fixed', reps: 5 },
                  supersetWithNext: true,
                  notes: 'Go deep',
                  link: 'https://example.com',
                  restBetweenSets: {
                    minRest: toDurationJSON(Duration.ofSeconds(120)),
                    maxRest: toDurationJSON(Duration.ofSeconds(180)),
                    failureRest: toDurationJSON(Duration.ofSeconds(300)),
                  },
                  progressiveOverload: {
                    type: 'IncreaseAllEvenlyProgressiveOverload',
                    amount: toBigNumberJSON(new BigNumber(5)),
                  },
                },
              ],
            },
          ],
        },
      }) as WeightedExerciseBlueprint;

      expect(exercise.name).toBe('Squat');
      expect(exercise.sets).toBe(5);
      expect(exercise.repsConfig).toEqual({ type: 'fixed', reps: 5 });
      expect(exercise.supersetWithNext).toBe(true);
      expect(exercise.notes).toBe('Go deep');
      expect(exercise.link).toBe('https://example.com');
      expect(exercise.progressiveOverload).toBeInstanceOf(IncreaseAllEvenlyProgressiveOverload);
      expect((exercise.progressiveOverload as IncreaseAllEvenlyProgressiveOverload).amount.toNumber()).toBe(5);
    });

    it('preserves trackPower when streamed in, and defaults to false when absent', () => {
      const withPower = firstExercise({
        version: 3,
        name: 'PPL',
        blueprint: {
          sessions: [
            {
              exercises: [
                {
                  type: 'WeightedExerciseBlueprint',
                  name: 'Squat',
                  trackPower: true,
                } as DeepPartial<WeightedExerciseBlueprintJSON>,
              ],
            },
          ],
        },
      }) as WeightedExerciseBlueprint;

      expect(withPower.trackPower).toBe(true);

      const withoutPower = firstExercise({
        version: 3,
        name: 'PPL',
        blueprint: { sessions: [{ exercises: [{ name: 'Bench' }] }] },
      }) as WeightedExerciseBlueprint;

      expect(withoutPower.trackPower).toBe(false);
    });
  });

  describe('progressive overload', () => {
    it('defaults the amount when only the type streamed in', () => {
      const exercise = firstExercise({
        version: 3,
        name: 'PPL',
        blueprint: {
          sessions: [
            {
              exercises: [
                {
                  type: 'WeightedExerciseBlueprint',
                  progressiveOverload: {
                    type: 'IncreaseAllEvenlyProgressiveOverload',
                  },
                },
              ],
            },
          ],
        },
      }) as WeightedExerciseBlueprint;

      const po = exercise.progressiveOverload as IncreaseAllEvenlyProgressiveOverload;
      expect(po).toBeInstanceOf(IncreaseAllEvenlyProgressiveOverload);
      expect(po.amount.toNumber()).toBe(2.5);
    });

    it('defaults the amount and strategy for an increase-lowest overload', () => {
      const exercise = firstExercise({
        version: 3,
        name: 'PPL',
        blueprint: {
          sessions: [
            {
              exercises: [
                {
                  type: 'WeightedExerciseBlueprint',
                  progressiveOverload: {
                    type: 'IncreaseLowestSetProgressiveOverload',
                  },
                },
              ],
            },
          ],
        },
      }) as WeightedExerciseBlueprint;

      const po = exercise.progressiveOverload as IncreaseLowestSetProgressiveOverload;
      expect(po).toBeInstanceOf(IncreaseLowestSetProgressiveOverload);
      expect(po.amount.toNumber()).toBe(2.5);
      expect(po.increaseStrategy).toBe('all');
    });
  });

  describe('cardio exercises', () => {
    it('produces a default time set when none streamed in', () => {
      const exercise = firstExercise({
        version: 3,
        name: 'PPL',
        blueprint: {
          sessions: [
            {
              exercises: [{ type: 'CardioExerciseBlueprint', name: 'Run' }],
            },
          ],
        },
      }) as CardioExerciseBlueprint;

      expect(exercise).toBeInstanceOf(CardioExerciseBlueprint);
      expect(exercise.name).toBe('Run');
      expect(exercise.sets).toHaveLength(1);
      expect(exercise.sets[0]!.target.type).toBe('time');
    });

    it('fills a partial distance target', () => {
      const exercise = firstExercise({
        version: 3,
        name: 'PPL',
        blueprint: {
          sessions: [
            {
              exercises: [
                {
                  type: 'CardioExerciseBlueprint',
                  name: 'Run',
                  sets: [{ target: { type: 'distance' } }],
                },
              ],
            },
          ],
        },
      }) as CardioExerciseBlueprint;

      const target = exercise.sets[0]!.target;
      expect(target.type).toBe('distance');
      if (target.type === 'distance') {
        expect(target.value.unit).toBe('kilometre');
        expect(target.value.value.toNumber()).toBe(0);
      }
    });
  });
});

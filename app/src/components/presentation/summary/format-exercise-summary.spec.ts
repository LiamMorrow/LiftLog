import { describe, expect, it, vi } from 'vitest';
import { formatExerciseSummary, formatSessionVolume } from '@/components/presentation/summary/format-exercise-summary';
import { PotentialSet, RecordedSet, RecordedWeightedExercise, Session } from '@/models/session-models';
import { SessionBlueprint } from '@/models/blueprint-models';
import { Weight } from '@/models/weight';
import { LocalDate } from '@js-joda/core';
import { v4 as uuid } from 'uuid';
import { makeRecordedExercise, makeWeightedBlueprint, tick } from '@/models/session-models/__test__/helpers';

vi.mock('expo-localization', () => ({ getLocales: () => [{ decimalSeparator: '.' }] }));

const filled = { isFilled: true, showWeight: true };

/** Every set is seeded with the plan's target, which is what building a session does. */
function exerciseOf(sets: { reps: number | undefined; weight: number }[], blueprint = makeWeightedBlueprint()) {
  return new RecordedWeightedExercise(
    blueprint,
    sets.map((set, index) =>
      PotentialSet.of({
        set:
          set.reps === undefined ? undefined : RecordedSet.of({ repsCompleted: set.reps, completionDateTime: tick() }),
        weight: new Weight(set.weight, 'kilograms'),
        target: blueprint.repsTargetForSet(index),
      }),
    ),
    undefined,
  );
}

function sessionOf(exercise: RecordedWeightedExercise) {
  return new Session(
    uuid(),
    new SessionBlueprint('Test', [exercise.blueprint], ''),
    [exercise],
    LocalDate.of(2025, 4, 5),
    undefined,
    undefined,
  );
}

describe('formatExerciseSummary', () => {
  it('collapses identical sets into a multiplier', () => {
    const exercise = exerciseOf([
      { reps: 12, weight: 60 },
      { reps: 12, weight: 60 },
      { reps: 12, weight: 60 },
    ]);

    expect(formatExerciseSummary(exercise, filled)).toBe('3 × 12 @ 60kg');
  });

  it('keeps a pyramid apart, because the variation is the point of it', () => {
    const exercise = exerciseOf([
      { reps: 12, weight: 60 },
      { reps: 10, weight: 70 },
      { reps: 8, weight: 80 },
    ]);

    expect(formatExerciseSummary(exercise, filled)).toBe('12 @ 60kg · 10 @ 70kg · 8 @ 80kg');
  });

  it('names the weight once for a run of sets at that weight', () => {
    const exercise = exerciseOf([
      { reps: 12, weight: 60 },
      { reps: 12, weight: 60 },
      { reps: 10, weight: 60 },
    ]);

    expect(formatExerciseSummary(exercise, filled)).toBe('2 × 12, 10 @ 60kg');
  });

  it('says nothing about weight rather than claiming zero', () => {
    const exercise = exerciseOf([
      { reps: 12, weight: 0 },
      { reps: 12, weight: 0 },
    ]);

    expect(formatExerciseSummary(exercise, filled)).toBe('2 × 12');
  });

  it('ignores sets that were never completed', () => {
    const exercise = exerciseOf([
      { reps: 12, weight: 60 },
      { reps: undefined, weight: 60 },
    ]);

    expect(formatExerciseSummary(exercise, filled)).toBe('12 @ 60kg');
  });

  it('states a plan as its shape, taking reps from the targets rather than what was recorded', () => {
    const exercise = exerciseOf([
      { reps: undefined, weight: 60 },
      { reps: undefined, weight: 60 },
    ]);

    expect(formatExerciseSummary(exercise, { isFilled: false, showWeight: true })).toBe('2 × 10 @ 60kg');
  });

  it('states the target the sets are chasing, not the plan they were seeded from', () => {
    // What a reps rule leaves behind: the plan still says 10, the session is on 11.
    const exercise = new RecordedWeightedExercise(
      makeWeightedBlueprint(),
      [0, 1, 2].map(() => PotentialSet.of({ weight: new Weight(0, 'kilograms'), target: { min: 11, max: 11 } })),
      undefined,
    );

    expect(formatExerciseSummary(exercise, { isFilled: false, showWeight: true })).toBe('3 × 11');
  });

  it('spells out a climb that has left some sets behind', () => {
    const exercise = new RecordedWeightedExercise(
      makeWeightedBlueprint(),
      [12, 10, 10].map((reps) =>
        PotentialSet.of({ weight: new Weight(0, 'kilograms'), target: { min: reps, max: reps } }),
      ),
      undefined,
    );

    expect(formatExerciseSummary(exercise, { isFilled: false, showWeight: true })).toBe('12/10/10');
  });

  it('gives a planned exercise whose weight steps a range, rather than a set-by-set list', () => {
    const exercise = exerciseOf([
      { reps: undefined, weight: 15 },
      { reps: undefined, weight: 20 },
      { reps: undefined, weight: 15 },
    ]);

    expect(formatExerciseSummary(exercise, { isFilled: false, showWeight: true })).toBe('3 × 10 @ 15–20kg');
  });
});

describe('formatExerciseSummary for bodyweight exercises', () => {
  function bodyweightExerciseOf(sets: { reps: number | undefined; weight: number }[]) {
    return new RecordedWeightedExercise(
      makeWeightedBlueprint({ name: 'Pull Up', resistance: 'bodyweight' }),
      sets.map((set, index) =>
        PotentialSet.of({
          set:
            set.reps === undefined
              ? undefined
              : RecordedSet.of({ repsCompleted: set.reps, completionDateTime: tick() }),
          weight: new Weight(set.weight, 'kilograms'),
          target: makeWeightedBlueprint().repsTargetForSet(index),
        }),
      ),
      undefined,
    );
  }

  it('shows just the bodyweight label when no weight is added', () => {
    const exercise = bodyweightExerciseOf([
      { reps: 12, weight: 0 },
      { reps: 12, weight: 0 },
    ]);

    expect(formatExerciseSummary(exercise, filled)).toBe('2 × 12 @ BW');
  });

  it('shows added weight with a plus sign', () => {
    const exercise = bodyweightExerciseOf([{ reps: 8, weight: 10 }]);

    expect(formatExerciseSummary(exercise, filled)).toBe('8 @ BW +10kg');
  });

  it('shows assistance as a negative added weight', () => {
    const exercise = bodyweightExerciseOf([{ reps: 8, weight: -20 }]);

    expect(formatExerciseSummary(exercise, filled)).toBe('8 @ BW -20kg');
  });
});

describe('formatSessionVolume', () => {
  it('totals the weight moved', () => {
    const session = sessionOf(
      exerciseOf([
        { reps: 10, weight: 60 },
        { reps: 10, weight: 60 },
      ]),
    );

    expect(formatSessionVolume(session)).toBe('1,200kg');
  });

  it('has no total to report for a bodyweight-only session', () => {
    const session = sessionOf(exerciseOf([{ reps: 10, weight: 0 }]));

    expect(formatSessionVolume(session)).toBeUndefined();
  });
});

describe('formatExerciseSummary for exercises that track no load', () => {
  const crunch = makeWeightedBlueprint({ name: 'Crunch', sets: 3, resistance: 'none' });

  it('says nothing about weight when logged', () => {
    const exercise = makeRecordedExercise(crunch, [20, 20, 20], new Weight(999, 'kilograms'));

    expect(formatExerciseSummary(exercise, filled)).toBe('3 × 20');
  });

  it('says nothing about weight when planned', () => {
    const exercise = makeRecordedExercise(crunch, [undefined, undefined, undefined], new Weight(999, 'kilograms'));

    expect(formatExerciseSummary(exercise, { isFilled: false, showWeight: true })).toBe('3 × 10');
  });
});

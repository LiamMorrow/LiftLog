import { describe, expect, it, vi } from 'vitest';
import { formatExerciseSummary, formatSessionVolume } from '@/components/presentation/summary/format-exercise-summary';
import { PotentialSet, RecordedSet, RecordedWeightedExercise, Session } from '@/models/session-models';
import { SessionBlueprint } from '@/models/blueprint-models';
import { Weight } from '@/models/weight';
import { LocalDate } from '@js-joda/core';
import { v4 as uuid } from 'uuid';
import { makeWeightedBlueprint, tick } from '@/models/session-models/__test__/helpers';

vi.mock('expo-localization', () => ({ getLocales: () => [{ decimalSeparator: '.' }] }));

const filled = { isFilled: true, showWeight: true };

function exerciseOf(sets: { reps: number | undefined; weight: number }[]) {
  return new RecordedWeightedExercise(
    makeWeightedBlueprint(),
    sets.map(
      (set) =>
        new PotentialSet(
          set.reps === undefined ? undefined : new RecordedSet(set.reps, tick()),
          new Weight(set.weight, 'kilograms'),
        ),
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

  it('states a plan as its shape, taking reps from the blueprint rather than what was recorded', () => {
    const exercise = exerciseOf([
      { reps: undefined, weight: 60 },
      { reps: undefined, weight: 60 },
    ]);

    expect(formatExerciseSummary(exercise, { isFilled: false, showWeight: true })).toBe('2 × 10 @ 60kg');
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

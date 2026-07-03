import { describe, it, expect } from 'vitest';
import { Duration } from '@js-joda/core';
import BigNumber from 'bignumber.js';
import { RecordedCardioExercise, RecordedCardioExerciseSet } from '@/models/session-models/recorded-cardio-exercise';
import { Distance } from '@/models/blueprint-models';
import { tick, makeCardioBlueprint, makeCardioSetBlueprint } from './__test__/helpers';

const distance: Distance = { value: BigNumber(5), unit: 'kilometre' };

describe('RecordedCardioExercise.withNothingCompleted', () => {
  it('clears completionDateTime and notes', () => {
    const bp = makeCardioBlueprint(2);
    const exercise = RecordedCardioExercise.empty(bp);
    const withData = exercise.withSet(0, (s) =>
      s.with({ completionDateTime: tick(), duration: Duration.ofMinutes(10) }),
    );
    const result = withData.withNothingCompleted();

    expect(result.sets.every((s) => s.completionDateTime === undefined)).toBe(true);
    expect(result.notes).toBeUndefined();
  });
});

// ─── withSet / withAllSets ────────────────────────────────────────────────────

describe('RecordedCardioExercise.withSet', () => {
  it('updates only the targeted set', () => {
    const bp = makeCardioBlueprint(3);
    const exercise = RecordedCardioExercise.empty(bp);
    const dur = Duration.ofMinutes(5);
    const result = exercise.withSet(1, (s) => s.with({ duration: dur }));

    expect(result.sets[0]!.duration).toBeUndefined();
    expect(result.sets[1]!.duration).toEqual(dur);
    expect(result.sets[2]!.duration).toBeUndefined();
  });
});

describe('RecordedCardioExercise.withAllSets', () => {
  it('applies reducer to every set', () => {
    const bp = makeCardioBlueprint(3);
    const exercise = RecordedCardioExercise.empty(bp);
    const dur = Duration.ofMinutes(3);
    const result = exercise.withAllSets((s) => s.with({ duration: dur }));

    expect(result.sets.every((s) => s.duration?.equals(dur))).toBe(true);
  });
});

// ─── constructor ──────────────────────────────────────────────────────────────

describe('RecordedCardioExercise constructor', () => {
  it('throws when there are no sets', () => {
    const bp = makeCardioBlueprint(1);
    expect(() => new RecordedCardioExercise(bp, [], undefined)).toThrow('at least one set');
  });
});

// ─── derived properties ───────────────────────────────────────────────────────

describe('RecordedCardioExercise derived values', () => {
  const completeSet = (exercise: RecordedCardioExercise, index: number, time = tick()) =>
    exercise.withSet(index, (s) => s.with({ duration: Duration.ofMinutes(5), distance, completionDateTime: time }));

  it('currentSetIndex points at the first unfilled set', () => {
    const exercise = completeSet(RecordedCardioExercise.empty(makeCardioBlueprint(3)), 0);
    expect(exercise.currentSetIndex).toBe(1);
  });

  it('currentSetIndex is -1 when every set is filled', () => {
    let exercise = RecordedCardioExercise.empty(makeCardioBlueprint(2));
    exercise = exercise.withAllSets((s) =>
      s.with({ duration: Duration.ofMinutes(5), distance, completionDateTime: tick() }),
    );
    expect(exercise.currentSetIndex).toBe(-1);
    expect(exercise.isComplete).toBe(true);
  });

  it('duration sums the duration of all sets', () => {
    let exercise = RecordedCardioExercise.empty(makeCardioBlueprint(2));
    exercise = exercise
      .withSet(0, (s) => s.with({ duration: Duration.ofMinutes(4) }))
      .withSet(1, (s) => s.with({ duration: Duration.ofMinutes(6) }));
    expect(exercise.duration!.toMinutes()).toBe(10);
  });

  it('isStarted reflects whether any set has a completion time', () => {
    const empty = RecordedCardioExercise.empty(makeCardioBlueprint(1));
    expect(empty.isStarted).toBe(false);
    expect(completeSet(empty, 0).isStarted).toBe(true);
  });

  it('earliestTime and latestTime bound the recorded completion times', () => {
    const first = tick();
    const last = first.plusSeconds(120);
    let exercise = RecordedCardioExercise.empty(makeCardioBlueprint(2));
    exercise = completeSet(exercise, 0, last);
    exercise = completeSet(exercise, 1, first);
    expect(exercise.earliestTime).toEqual(first);
    expect(exercise.latestTime).toEqual(last);
  });
});

// ─── equals / JSON ────────────────────────────────────────────────────────────

describe('RecordedCardioExercise equality and JSON', () => {
  it('round-trips through toJSON/fromJSON', () => {
    let exercise = RecordedCardioExercise.empty(makeCardioBlueprint(2));
    exercise = exercise.withSet(0, (s) =>
      s.with({ duration: Duration.ofMinutes(5), distance, completionDateTime: tick() }),
    );

    const restored = RecordedCardioExercise.fromJSON(exercise.toJSON());

    expect(restored.equals(exercise)).toBe(true);
  });

  it('equals is false against undefined and true against itself', () => {
    const exercise = RecordedCardioExercise.empty(makeCardioBlueprint(1));
    expect(exercise.equals(undefined)).toBe(false);
    expect(exercise.equals(exercise)).toBe(true);
  });

  it('equals is false when notes differ', () => {
    const exercise = RecordedCardioExercise.empty(makeCardioBlueprint(1));
    expect(exercise.equals(exercise.with({ notes: 'changed' }))).toBe(false);
  });
});

// ─── RecordedCardioExerciseSet ────────────────────────────────────────────────

describe('RecordedCardioExerciseSet', () => {
  it('isCompletelyFilled requires all tracked fields', () => {
    const bp = makeCardioSetBlueprint({ trackDuration: true });
    const empty = RecordedCardioExerciseSet.empty(bp);
    expect(empty.isCompletelyFilled).toBe(false);
    expect(empty.with({ duration: Duration.ofMinutes(5) }).isCompletelyFilled).toBe(false);
    expect(empty.with({ duration: Duration.ofMinutes(5), distance }).isCompletelyFilled).toBe(true);
  });

  it('isCompletelyFilled is false while a timer block is running', () => {
    const bp = makeCardioSetBlueprint({ trackDuration: true });
    const running = RecordedCardioExerciseSet.empty(bp).with({
      duration: Duration.ofMinutes(5),
      distance,
      currentBlockStartTime: tick(),
    });
    expect(running.isCompletelyFilled).toBe(false);
  });

  it('withCompletionTimeIfCompleted stamps time only when there is data', () => {
    const bp = makeCardioSetBlueprint({ trackDuration: true });
    const t = tick();
    const empty = RecordedCardioExerciseSet.empty(bp);

    expect(empty.withCompletionTimeIfCompleted(t).completionDateTime).toBeUndefined();
    expect(empty.with({ duration: Duration.ofMinutes(5) }).withCompletionTimeIfCompleted(t).completionDateTime).toEqual(
      t,
    );
  });

  it('withCompletionTimeIfCompleted keeps an existing completion time', () => {
    const bp = makeCardioSetBlueprint({ trackDuration: true });
    const existing = tick();
    const set = RecordedCardioExerciseSet.empty(bp).with({
      duration: Duration.ofMinutes(5),
      completionDateTime: existing,
    });
    expect(set.withCompletionTimeIfCompleted(tick()).completionDateTime).toEqual(existing);
  });

  it('equals compares by value', () => {
    const bp = makeCardioSetBlueprint({ trackDuration: true });
    const t = tick();
    const a = RecordedCardioExerciseSet.empty(bp).with({ duration: Duration.ofMinutes(5), completionDateTime: t });
    const b = RecordedCardioExerciseSet.empty(bp).with({ duration: Duration.ofMinutes(5), completionDateTime: t });

    expect(a.equals(b)).toBe(true);
    expect(a.equals(undefined)).toBe(false);
    expect(a.equals(b.with({ duration: Duration.ofMinutes(6) }))).toBe(false);
  });
});

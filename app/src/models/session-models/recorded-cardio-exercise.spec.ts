import { describe, it, expect } from 'vitest';
import { Duration } from '@js-joda/core';
import { RecordedCardioExercise } from '@/models/session-models/recorded-cardio-exercise';
import { tick, makeCardioBlueprint } from './__test__/helpers';

describe('RecordedCardioExercise.withNothingCompleted', () => {
  it('clears completionDateTime and notes', () => {
    const bp = makeCardioBlueprint(2);
    const exercise = RecordedCardioExercise.empty(bp);
    const withData = exercise.withSet(0, (s) =>
      s.with({ completionDateTime: tick(), duration: Duration.ofMinutes(10) }),
    );
    const result = withData.withNothingCompleted();

    expect(result.sets.every((s) => s.completionDateTime === undefined)).toBe(
      true,
    );
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

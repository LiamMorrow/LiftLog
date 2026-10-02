import { describe, it, expect } from 'vitest';
import { Duration, LocalDate } from '@js-joda/core';
import { SessionBlueprint } from '@/models/blueprint-models';
import { Session } from '@/models/session-models/session';
import { RestTimer } from '@/models/session-models/rest-timer';
import { RecordedCardioExercise } from '@/models/session-models/recorded-cardio-exercise';
import { RecordedWeightedExercise } from '@/models/session-models/recorded-weighted-exercise';
import {
  emptyPotentialSet,
  filledPotentialSet,
  makeCardioBlueprint,
  makeSession,
  makeRecordedExercise,
  makeWeightedBlueprint,
  tick,
} from '@/models/session-models/__test__/helpers';
import { getCardioTimerInfo, getCurrentExerciseDetails, getTimerInfo } from '@/store/workout-worker/helpers';
import { uuid } from '@/utils/uuid';

describe('rest timer after logged reps corrections', () => {
  const target = { min: 5, max: 10 };
  function setup() {
    const start = tick();
    const blueprint = makeWeightedBlueprint({
      plannedSets: [target, target, target].map((reps) => ({ reps })),
      restBetweenSets: {
        minRest: Duration.ofSeconds(5),
        maxRest: Duration.ofSeconds(5),
        failureRest: Duration.ofMinutes(5),
      },
    });
    const exercise = makeRecordedExercise(blueprint, [10, 10, undefined], undefined, (i) =>
      start.minusSeconds(60 - i * 60),
    );
    return { start, exercise, session: makeSession([blueprint]).withExercise(0, exercise).withRestTimerAt(start) };
  }

  it.each([10, 5, 4, 0, 11])('uses the current latest reps (%i) without changing elapsed time', (reps) => {
    const { start, exercise, session } = setup();
    const corrected = session.withWeightedExercise(0, exercise.withRepCount(1, reps, start.plusSeconds(20)));
    const end = start.plusSeconds(reps < 5 ? 300 : 5);
    expect(corrected.restTimer).toBe(session.restTimer);
    expect(corrected.lastExercise?.latestTime).toEqual(start);
    expect(corrected.restTimer!.elapsed(start.plusSeconds(20))).toEqual(Duration.ofSeconds(20));
    expect(corrected.restTimerEndTime).toEqual(end);
    expect(getTimerInfo(corrected)).toEqual({
      startedAt: start.toInstant().toString(),
      partiallyEndAt: end.toInstant().toString(),
      endAt: end.toInstant().toString(),
    });
  });

  it('keeps normal rest through 5 reps and switches to failure rest at 4 when tapping', () => {
    const { start, exercise, session } = setup();
    let current = exercise;
    for (let reps = 9; reps >= 4; reps--) {
      current = current.withCycledRepCount(1, start.plusSeconds(20));
      const updated = session.withWeightedExercise(0, current);
      expect(updated.restTimer).toBe(session.restTimer);
      expect(updated.restTimerEndTime).toEqual(start.plusSeconds(reps < 5 ? 300 : 5));
    }
  });

  it('extends an expired normal rest and shortens it again relative to the original start', () => {
    const { start, exercise, session } = setup();
    const now = start.plusSeconds(20);
    expect(session.restTimerEndTime!.isBefore(now)).toBe(true);
    const failed = session.withWeightedExercise(0, exercise.withRepCount(1, 4, now));
    expect(Duration.between(now, failed.restTimerEndTime!)).toEqual(Duration.ofSeconds(280));
    const corrected = failed.withWeightedExercise(0, exercise.withRepCount(1, 5, now));
    expect(corrected.restTimer).toBe(session.restTimer);
    expect(corrected.restTimerEndTime).toEqual(start.plusSeconds(5));
    expect(corrected.restTimerEndTime!.isBefore(now)).toBe(true);
    expect(failed.restTimerEndTime!.isBefore(start.plusMinutes(6))).toBe(true);
  });

  it.each(['running', 'paused', 'dismissed'] as const)(
    'leaves an older set correction or removal out of the %s timer',
    (state) => {
      const { start, exercise, session: running } = setup();
      const session =
        state === 'paused'
          ? running.with({ restTimer: running.restTimer!.pause(start.plusSeconds(2)) })
          : state === 'dismissed'
            ? running.withRestTimerAt(undefined)
            : running;
      for (const reps of [4, 5, 0, undefined]) {
        const updated = session.withWeightedExercise(0, exercise.withRepCount(0, reps, start.plusSeconds(20)));
        expect(updated.restTimer).toBe(session.restTimer);
        expect(updated.lastExercise?.latestTime).toEqual(start);
        expect(updated.restTimerEndTime).toEqual(session.restTimerEndTime);
        expect(getTimerInfo(updated)).toEqual(getTimerInfo(session));
      }
    },
  );

  it('ignores edits and removals in a different, older exercise', () => {
    const { start, exercise } = setup();
    const older = makeRecordedExercise(
      exercise.blueprint.with({ name: 'Older' }),
      [10, undefined, undefined],
      undefined,
      () => start.minusMinutes(2),
    );
    const before = makeSession([exercise.blueprint, older.blueprint])
      .withExercise(0, exercise)
      .withExercise(1, older)
      .withRestTimerAt(start);
    for (const reps of [4, 5, undefined]) {
      const after = before.withWeightedExercise(1, older.withRepCount(0, reps, start.plusSeconds(20)));
      expect(after.restTimer).toBe(before.restTimer);
      expect(getTimerInfo(after)).toEqual(getTimerInfo(before));
    }
  });

  it('uses completion time rather than set position to choose the recovering set', () => {
    const { start, exercise, session } = setup();
    const outOfOrder = makeRecordedExercise(exercise.blueprint, [10, 4, undefined], undefined, (i) =>
      start.minusSeconds(i * 60),
    );
    const before = session.withExercise(0, outOfOrder);
    expect(before.lastSetFailed).toBe(false);
    const after = before.withWeightedExercise(0, outOfOrder.withRepCount(1, 0, start.plusSeconds(20)));
    expect(after.restTimerEndTime).toEqual(start.plusSeconds(5));
    expect(after.restTimer).toBe(before.restTimer);
  });

  it('keeps paused elapsed time while correcting failure, then schedules from the resumed anchor', () => {
    const { start, exercise, session } = setup();
    const paused = session.with({ restTimer: session.restTimer!.pause(start.plusSeconds(2)) });
    const corrected = paused.withWeightedExercise(0, exercise.withRepCount(1, 4, start.plusSeconds(20)));
    expect(corrected.restTimer).toBe(paused.restTimer);
    expect(corrected.restTimer!.elapsed(start.plusMinutes(1))).toEqual(Duration.ofSeconds(2));
    expect(getTimerInfo(corrected)).toBeUndefined();
    expect(corrected.restTimerEndTime).toBeUndefined();
    const resumed = corrected.with({ restTimer: corrected.restTimer!.resume(start.plusSeconds(20)) });
    expect(resumed.restTimerEndTime).toEqual(start.plusSeconds(318));
  });

  it('does not resurrect a dismissed timer when the latest reps are corrected', () => {
    const { start, exercise, session } = setup();
    const dismissed = session.withRestTimerAt(undefined);
    const corrected = dismissed.withWeightedExercise(0, exercise.withRepCount(1, 4, start.plusSeconds(20)));
    expect(corrected.restTimer).toBeUndefined();
    expect(getTimerInfo(corrected)).toBeUndefined();
  });

  it('starts a new rest on logging a new set and falls back on removing the latest set', () => {
    const { start, exercise, session } = setup();
    const logged = session.withWeightedExercise(0, exercise.withRepCount(2, 4, start.plusSeconds(20)));
    expect(logged.restTimer!.startedAt).toEqual(start.plusSeconds(20));
    const removed = logged.withWeightedExercise(0, exercise.withRepCount(1, undefined, start.plusSeconds(30)));
    expect(removed.restTimer!.startedAt).toEqual(start.minusSeconds(60));
    const empty = removed.withWeightedExercise(0, exercise.withNothingCompleted());
    expect(empty.restTimer).toBeUndefined();
  });
});

describe('getCardioTimerInfo', () => {
  it('returns undefined when no cardio set has a running timer', () => {
    const session = makeSession([makeCardioBlueprint(1)]);
    expect(getCardioTimerInfo(session)).toBeUndefined();
  });

  it('reports the exercise and set index of the running timer', () => {
    const cardio = RecordedCardioExercise.empty(makeCardioBlueprint(2)).withSet(1, (s) =>
      s.with({ currentBlockStartTime: tick() }),
    );
    const session = new Session(
      uuid(),
      new SessionBlueprint('Test', [cardio.blueprint], ''),
      [cardio],
      LocalDate.of(2025, 4, 5),
      undefined,
      undefined,
    );

    const info = getCardioTimerInfo(session)!;

    expect(info.exerciseIndex).toBe(0);
    expect(info.setIndex).toBe(1);
    expect(info.currentBlockStartTime).toBeDefined();
  });
});

describe('getCurrentExerciseDetails', () => {
  it('returns undefined when there is no next exercise', () => {
    const session = makeSession([]);
    expect(getCurrentExerciseDetails(session)).toBeUndefined();
  });

  it('returns the serialized next exercise and its current set index', () => {
    const session = makeSession([makeWeightedBlueprint({ name: 'Squat' })]);
    const details = getCurrentExerciseDetails(session)!;
    expect(details.setIndex).toBe(0);
    expect(details.exercise).toBeDefined();
  });
});

describe('getTimerInfo', () => {
  function sessionWithRestTimer(reps: number, start = tick()) {
    const bp = makeWeightedBlueprint();
    const exercise = new RecordedWeightedExercise(
      bp,
      [filledPotentialSet(reps, tick()), emptyPotentialSet(100)],
      undefined,
    );
    return new Session(
      uuid(),
      new SessionBlueprint('Test', [bp], ''),
      [exercise],
      LocalDate.of(2025, 4, 5),
      undefined,
      new RestTimer(start),
    );
  }

  it('returns undefined without a running rest timer', () => {
    const bp = makeWeightedBlueprint();
    const exercise = new RecordedWeightedExercise(bp, [filledPotentialSet(10, tick())], undefined);
    const session = new Session(
      uuid(),
      new SessionBlueprint('Test', [bp], ''),
      [exercise],
      LocalDate.of(2025, 4, 5),
      undefined,
      undefined,
    );
    expect(getTimerInfo(session)).toBeUndefined();
  });

  it('returns partial and full rest times after a successful set', () => {
    const info = getTimerInfo(sessionWithRestTimer(10))!;
    expect(info.startedAt).toBeDefined();
    expect(info.partiallyEndAt).toBeDefined();
    expect(info.endAt).toBeDefined();
  });

  it('returns equal partial and full rest after a failed set', () => {
    const info = getTimerInfo(sessionWithRestTimer(3))!;
    expect(info.partiallyEndAt).toEqual(info.endAt);
  });

  function sessionWithPyramidRestTimer(lastSetReps: number) {
    const bp = makeWeightedBlueprint().with({
      sets: 3,
      repsConfig: {
        type: 'perSet',
        targets: [
          { min: 12, max: 12 },
          { min: 10, max: 10 },
          { min: 8, max: 8 },
        ],
      },
    });
    // Set 0 stays open so a next exercise exists; the most recent completion is set 2 (target 8).
    const exercise = makeRecordedExercise(bp, [undefined, 10, lastSetReps]);
    return new Session(
      uuid(),
      new SessionBlueprint('Test', [bp], ''),
      [exercise],
      LocalDate.of(2025, 4, 5),
      undefined,
      new RestTimer(tick()),
    );
  }

  it("judges rest against the last completed set's own pyramid target", () => {
    // Last completed set targets 8; hitting it is a success even though it is below the earlier sets' targets.
    const success = getTimerInfo(sessionWithPyramidRestTimer(8))!;
    expect(success.partiallyEndAt).not.toEqual(success.endAt);

    const failure = getTimerInfo(sessionWithPyramidRestTimer(7))!;
    expect(failure.partiallyEndAt).toEqual(failure.endAt);
  });
});

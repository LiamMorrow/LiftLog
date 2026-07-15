import { describe, it, expect } from 'vitest';
import { LocalDate } from '@js-joda/core';
import { ProgramBlueprint, SessionBlueprint } from '@/models/blueprint-models';
import { Session } from '@/models/session-models/session';
import { RestTimer } from '@/models/session-models/rest-timer';
import { RecordedCardioExercise } from '@/models/session-models/recorded-cardio-exercise';
import { PotentialSet, RecordedWeightedExercise } from '@/models/session-models/recorded-weighted-exercise';
import { Weight as WeightModel } from '@/models/weight';
import {
  tick,
  makeSession,
  makeWeightedBlueprint,
  makeCardioBlueprint,
  filledPotentialSet,
} from '@/models/session-models/__test__/helpers';
import {
  getPlanDiff,
  getCardioTimerInfo,
  getCurrentExerciseDetails,
  getTimerInfo,
} from '@/store/current-session/helpers';
import { uuid } from '@/utils/uuid';

function programWith(sessions: SessionBlueprint[]) {
  return new ProgramBlueprint('Plan', sessions, LocalDate.of(2025, 4, 5));
}

describe('getPlanDiff', () => {
  it('returns undefined when the session blueprint already matches the plan', () => {
    const session = makeSession([makeWeightedBlueprint('Squat')]);
    const program = programWith([session.blueprint]);
    expect(getPlanDiff(program, session)).toBeUndefined();
  });

  it('returns a diff against the same-named session in the plan', () => {
    const original = makeSession([makeWeightedBlueprint('Squat')]);
    const edited = original.withAddedExercise(makeWeightedBlueprint('Bench'), false);
    const program = programWith([original.blueprint]);

    const result = getPlanDiff(program, edited)!;

    expect(result.type).toBe('diff');
    if (result.type === 'diff') {
      expect(result.sessionIndex).toBe(0);
      expect(result.diff.hasChanges).toBe(true);
    }
  });

  it('returns an add diff when no session shares the name', () => {
    const session = makeSession([makeWeightedBlueprint('Squat')]);
    const program = programWith([makeSession([makeWeightedBlueprint('Row')]).withName('Cardio Day').blueprint]);

    const result = getPlanDiff(program, session)!;

    expect(result.type).toBe('add');
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
    const session = makeSession([makeWeightedBlueprint('Squat')]);
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
      [filledPotentialSet(reps, tick()), new PotentialSet(undefined, new WeightModel(100, 'kilograms'))],
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
    const exercise = new RecordedWeightedExercise(
      bp,
      [
        new PotentialSet(undefined, new WeightModel(100, 'kilograms')),
        filledPotentialSet(10, tick()),
        filledPotentialSet(lastSetReps, tick()),
      ],
      undefined,
    );
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

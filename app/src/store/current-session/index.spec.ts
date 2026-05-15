import { LocalDate, OffsetDateTime } from '@js-joda/core';
import BigNumber from 'bignumber.js';
import { describe, expect, it, vi } from 'vitest';
import {
  Rest,
  SessionBlueprint,
  WeightedExerciseBlueprint,
} from '@/models/blueprint-models';
import {
  PotentialSet,
  RecordedSet,
  RecordedWeightedExercise,
  Session,
} from '@/models/session-models';
import {
  currentSessionReducer,
  setCurrentSession,
  setWorkoutSessionLastSetTime,
  stopRestTimer,
} from '@/store/current-session';
import { Weight } from '@/models/weight';
import { getTimerInfo } from '@/store/current-session/helpers';

vi.mock('@/utils/uuid', () => ({
  uuid: () => '00000000-0000-4000-8000-000000000000',
  uuidParse: (value: string) => value,
  uuidStringify: (value: string) => value,
}));

describe('current session rest timer', () => {
  it('stops the current rest timer without needing a session change', () => {
    const lastSetTime = OffsetDateTime.parse('2026-05-13T10:00:00Z');

    const runningState = currentSessionReducer(
      undefined,
      setWorkoutSessionLastSetTime(lastSetTime),
    );

    expect(runningState.workoutSessionLastSetTime).toBe(lastSetTime);

    const stoppedState = currentSessionReducer(runningState, stopRestTimer());

    expect(stoppedState.workoutSessionLastSetTime).toBeUndefined();
    expect(stoppedState.workoutSession).toBe(runningState.workoutSession);
  });

  it('keeps a stopped rest timer suppressed when the workout session is rehydrated', () => {
    const lastSetTime = OffsetDateTime.parse('2026-05-13T10:00:00Z');
    const session = createWorkoutSession(lastSetTime);

    const runningState = currentSessionReducer(
      undefined,
      setCurrentSession({
        target: 'workoutSession',
        session,
      }),
    );
    expect(runningState.workoutSessionLastSetTime?.equals(lastSetTime)).toBe(
      true,
    );

    const stoppedState = currentSessionReducer(runningState, stopRestTimer());
    expect(stoppedState.workoutSessionLastSetTime).toBeUndefined();

    const rehydratedState = currentSessionReducer(
      stoppedState,
      setCurrentSession({
        target: 'workoutSession',
        session,
      }),
    );

    expect(rehydratedState.workoutSessionLastSetTime).toBeUndefined();
  });

  it('starts the rest timer again when a newer set is recorded after stopping it', () => {
    const stoppedSetTime = OffsetDateTime.parse('2026-05-13T10:00:00Z');
    const nextSetTime = OffsetDateTime.parse('2026-05-13T10:07:00Z');

    const runningState = currentSessionReducer(
      undefined,
      setCurrentSession({
        target: 'workoutSession',
        session: createWorkoutSession(stoppedSetTime),
      }),
    );
    const stoppedState = currentSessionReducer(runningState, stopRestTimer());

    const nextSetState = currentSessionReducer(
      stoppedState,
      setCurrentSession({
        target: 'workoutSession',
        session: createWorkoutSession(nextSetTime),
      }),
    );

    expect(nextSetState.workoutSessionLastSetTime?.equals(nextSetTime)).toBe(
      true,
    );
    expect(nextSetState.workoutSessionRestTimerStoppedAt).toBeUndefined();
  });

  it('can suppress the timer when the stop action is received before session hydration', () => {
    const stoppedSetTime = OffsetDateTime.parse('2026-05-13T10:00:00Z');

    const stoppedBeforeHydrationState = currentSessionReducer(
      undefined,
      stopRestTimer(stoppedSetTime),
    );

    const hydratedState = currentSessionReducer(
      stoppedBeforeHydrationState,
      setCurrentSession({
        target: 'workoutSession',
        session: createWorkoutSession(stoppedSetTime),
      }),
    );

    expect(hydratedState.workoutSessionLastSetTime).toBeUndefined();
  });

  it('uses the newly completed exercise for rest when set timestamps tie', () => {
    const setTime = OffsetDateTime.parse('2026-05-13T10:00:00Z');
    const session = createTwoExerciseWorkoutSession(setTime);

    expect(session.nextExercise?.blueprint.name).toBe('Bench Press');

    const timerInfo = getTimerInfo(session, setTime);

    expect(
      timerInfo?.partiallyEndAt.equals(
        setTime.plus(Rest.long.minRest).toInstant(),
      ),
    ).toBe(true);
  });
});

function createWorkoutSession(lastSetTime: OffsetDateTime) {
  const exercise = WeightedExerciseBlueprint.empty().with({
    name: 'Squat',
    sets: 2,
    repsPerSet: 10,
    restBetweenSets: Rest.medium,
    weightIncreaseOnSuccess: BigNumber(0),
  });
  return new Session(
    'session-id',
    new SessionBlueprint('Workout', [exercise], ''),
    [
      new RecordedWeightedExercise(
        exercise,
        [
          new PotentialSet(new RecordedSet(10, lastSetTime), Weight.NIL),
          new PotentialSet(undefined, Weight.NIL),
        ],
        undefined,
      ),
    ],
    LocalDate.parse('2026-05-13'),
    undefined,
  );
}

function createTwoExerciseWorkoutSession(lastSetTime: OffsetDateTime) {
  const squat = WeightedExerciseBlueprint.empty().with({
    name: 'Squat',
    sets: 2,
    repsPerSet: 10,
    restBetweenSets: Rest.short,
    weightIncreaseOnSuccess: BigNumber(0),
  });
  const benchPress = WeightedExerciseBlueprint.empty().with({
    name: 'Bench Press',
    sets: 2,
    repsPerSet: 10,
    restBetweenSets: Rest.long,
    weightIncreaseOnSuccess: BigNumber(0),
  });
  return new Session(
    'session-id',
    new SessionBlueprint('Workout', [squat, benchPress], ''),
    [
      new RecordedWeightedExercise(
        squat,
        [
          new PotentialSet(new RecordedSet(10, lastSetTime), Weight.NIL),
          new PotentialSet(undefined, Weight.NIL),
        ],
        undefined,
      ),
      new RecordedWeightedExercise(
        benchPress,
        [
          new PotentialSet(new RecordedSet(10, lastSetTime), Weight.NIL),
          new PotentialSet(undefined, Weight.NIL),
        ],
        undefined,
      ),
    ],
    LocalDate.parse('2026-05-13'),
    undefined,
  );
}

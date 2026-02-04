import { WeightedExerciseBlueprintPOJO } from '@/models/blueprint-models';
import {
  RecordedCardioExercise,
  RecordedSetPOJO,
  RecordedWeightedExercise,
  Session,
} from '@/models/session-models';
import {
  CardioTimerInfo,
  RestTimerInfo,
} from '@/models/workout-worker-messages';
import { Duration, OffsetDateTime } from '@js-joda/core';
import { match, P } from 'ts-pattern';

export function getCycledRepCount(
  recordedSet: RecordedSetPOJO | undefined,
  exerciseBlueprint: WeightedExerciseBlueprintPOJO,
  time: OffsetDateTime,
): RecordedSetPOJO | undefined {
  return match(recordedSet)
    .returnType<RecordedSetPOJO | undefined>()
    .with(undefined, () => ({
      type: 'RecordedSet',
      completionDateTime: time,
      repsCompleted: exerciseBlueprint.repsPerSet,
    }))
    .with({ repsCompleted: 0 }, () => undefined)
    .otherwise((x) => ({
      ...x,
      repsCompleted: x.repsCompleted - 1,
    }));
}

export function getCardioTimerInfo(
  session: Session,
): CardioTimerInfo | undefined {
  const exerciseIndex = session.recordedExercises.findIndex(
    (x) =>
      x instanceof RecordedCardioExercise &&
      x.sets.some((s) => s.currentBlockStartTime),
  );

  if (exerciseIndex === -1) {
    return undefined;
  }

  const exerciseWithRunningTimer = session.recordedExercises[
    exerciseIndex
  ] as RecordedCardioExercise;
  const setIndex = exerciseWithRunningTimer.sets.findIndex(
    (s) => s.currentBlockStartTime,
  );

  if (setIndex === -1) {
    return undefined;
  }

  return {
    currentBlockStartTime:
      exerciseWithRunningTimer.sets[
        setIndex
      ].currentBlockStartTime?.toInstant(),
    currentDuration: exerciseWithRunningTimer.duration ?? Duration.ZERO,
    exerciseIndex,
    setIndex,
  };
}

export function getTimerInfo(
  session: Session,
  lastSetTime: OffsetDateTime | undefined,
): RestTimerInfo | undefined {
  const lastExercise = session.lastExercise;
  const nextExercise = session.nextExercise;
  if (
    !lastSetTime ||
    !lastExercise ||
    !nextExercise ||
    !(nextExercise instanceof RecordedWeightedExercise) ||
    !(lastExercise instanceof RecordedWeightedExercise)
  ) {
    return undefined;
  }

  const repsPerSet = lastExercise.blueprint.repsPerSet;
  const { minRest, maxRest, failureRest } =
    lastExercise.blueprint.restBetweenSets;

  const rest = match(lastExercise.lastRecordedSet)
    .with({ set: { repsCompleted: P.when((x) => x >= repsPerSet) } }, () => ({
      partialRest: minRest,
      fullRest: maxRest,
    }))
    .with({ set: { repsCompleted: P.when((x) => x < repsPerSet) } }, () => ({
      partialRest: failureRest,
      fullRest: failureRest,
    }))
    .otherwise(() => ({
      partialRest: Duration.ZERO,
      fullRest: Duration.ZERO,
    }));

  if (rest.partialRest.equals(Duration.ZERO)) {
    return;
  }
  return {
    startedAt: lastSetTime.toInstant(),
    partiallyEndAt: lastSetTime.plus(rest.partialRest).toInstant(),
    endAt: lastSetTime.plus(rest.fullRest).toInstant(),
  };
}

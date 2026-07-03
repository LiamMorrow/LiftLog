import { EmptySession, RecordedCardioExercise, RecordedWeightedExercise, Session } from '@/models/session-models';
import { toDurationJSON, toInstantJson } from '@/models/storage/versions/latest';
import { CardioTimerInfo, CurrentExerciseDetails, RestTimerInfo } from '@/models/workout-worker-messages';
import { diffSessionBlueprints, PlanDiff } from '@/models/blueprint-diff';
import { ProgramBlueprint } from '@/models/blueprint-models';
import { Duration } from '@js-joda/core';
import { match, P } from 'ts-pattern';

/**
 * Computes how a finished session differs from the active plan, or `undefined`
 * if the session already matches a workout in the plan.
 */
export function getPlanDiff(program: ProgramBlueprint, session: Session): PlanDiff | undefined {
  const sessionInPlan = program.sessions.some((x) => x.equals(session.blueprint));
  if (sessionInPlan) {
    return undefined;
  }

  const sessionWithSameNameInPlan = program.sessions.find((x) => x.name === session.blueprint.name);
  return sessionWithSameNameInPlan
    ? {
        type: 'diff',
        diff: diffSessionBlueprints(sessionWithSameNameInPlan, session.blueprint),
        sessionIndex: program.sessions.indexOf(sessionWithSameNameInPlan),
      }
    : {
        type: 'add',
        diff: diffSessionBlueprints(EmptySession.blueprint, session.blueprint),
      };
}

export function getCardioTimerInfo(session: Session): CardioTimerInfo | undefined {
  const exerciseIndex = session.recordedExercises.findIndex(
    (x) => x instanceof RecordedCardioExercise && x.sets.some((s) => s.currentBlockStartTime),
  );

  if (exerciseIndex === -1) {
    return undefined;
  }

  const exerciseWithRunningTimer = session.recordedExercises[exerciseIndex] as RecordedCardioExercise;
  const setIndex = exerciseWithRunningTimer.sets.findIndex((s) => s.currentBlockStartTime);

  if (setIndex === -1) {
    return undefined;
  }

  return {
    currentBlockStartTime: toInstantJson(exerciseWithRunningTimer.sets[setIndex]?.currentBlockStartTime?.toInstant()),
    currentDuration: toDurationJSON(exerciseWithRunningTimer.duration ?? Duration.ZERO),
    exerciseIndex,
    setIndex,
  };
}

export function getCurrentExerciseDetails(session: Session): CurrentExerciseDetails | undefined {
  return session.nextExercise
    ? {
        exercise: session.nextExercise.toJSON(),
        setIndex: session.nextExercise.currentSetIndex,
      }
    : undefined;
}

export function getTimerInfo(session: Session): RestTimerInfo | undefined {
  const lastExercise = session.lastExercise;
  const nextExercise = session.nextExercise;
  if (
    !session.restTimerStartTime ||
    !lastExercise ||
    !nextExercise ||
    !(nextExercise instanceof RecordedWeightedExercise) ||
    !(lastExercise instanceof RecordedWeightedExercise)
  ) {
    return undefined;
  }

  const repsPerSet = lastExercise.blueprint.repsPerSet;
  const { minRest, maxRest, failureRest } = lastExercise.blueprint.restBetweenSets;

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
    startedAt: toInstantJson(session.restTimerStartTime.toInstant()),
    partiallyEndAt: toInstantJson(session.restTimerStartTime.plus(rest.partialRest).toInstant()),
    endAt: toInstantJson(session.restTimerStartTime.plus(rest.fullRest).toInstant()),
  };
}

import {
  EmptySession,
  RecordedCardioExercise,
  RecordedExercise,
  RecordedWeightedExercise,
  Session,
} from '@/models/session-models';
import { toDurationJSON, toInstantJson } from '@/models/storage/versions/latest';
import { CardioTimerInfo, CurrentExerciseDetails, RestTimerInfo } from '@/models/workout-worker-messages';
import { diffSessionBlueprints, PlanDiff } from '@/models/blueprint-diff';
import { ProgramBlueprint } from '@/models/blueprint-models';
import { Duration } from '@js-joda/core';

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
  const running = session.runningCardioSet;
  if (!running) {
    return undefined;
  }

  const { set, exerciseIndex, setIndex } = running;
  return {
    currentBlockStartTime: toInstantJson(set.currentBlockStartTime?.toInstant()),
    // The notification anchors its clock at `currentBlockStartTime - currentDuration`, so this must
    // be the set's own banked time and not the exercise's running total.
    currentDuration: toDurationJSON(set.duration ?? Duration.ZERO),
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
  if (!session.restTimer || session.restTimer.isPaused || !lastExercise || !nextExercise) {
    return undefined;
  }

  const rest = getRestWindow(lastExercise);
  if (!rest || rest.partialRest.equals(Duration.ZERO)) {
    return;
  }
  return {
    startedAt: toInstantJson(session.restTimer.startedAt.toInstant()),
    partiallyEndAt: toInstantJson(session.restTimer.startedAt.plus(rest.partialRest).toInstant()),
    endAt: toInstantJson(session.restTimer.startedAt.plus(rest.fullRest).toInstant()),
  };
}

/** Cardio rests per set and has nothing to fail; a weighted exercise rests per exercise. */
function getRestWindow(lastExercise: RecordedExercise) {
  if (lastExercise instanceof RecordedCardioExercise) {
    const rest = lastExercise.lastCompletedSet?.blueprint.restBetweenSets;
    return rest && { partialRest: rest.minRest, fullRest: rest.maxRest };
  }
  if (!(lastExercise instanceof RecordedWeightedExercise)) {
    return undefined;
  }

  const { minRest, maxRest, failureRest } = lastExercise.blueprint.restBetweenSets;

  const lastSet = lastExercise.lastRecordedSet;
  if (!lastSet?.set) {
    return { partialRest: Duration.ZERO, fullRest: Duration.ZERO };
  }

  const targetMin = lastExercise.blueprint.repsTargetForSet(lastExercise.potentialSets.indexOf(lastSet)).min;
  return lastSet.set.repsCompleted >= targetMin
    ? { partialRest: minRest, fullRest: maxRest }
    : { partialRest: failureRest, fullRest: failureRest };
}

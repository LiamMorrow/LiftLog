import { NormalizedName } from '@/models/blueprint-models';
import { Session } from '@/models/session-models';
import { Weight } from '@/models/weight';
import { calculateOneRepMax } from '@/store/stats/calculate-stats';

export interface PersonalRecord {
  exerciseName: string;
  oneRepMax: Weight;
}

function bestOneRepMax(session: Session): Map<string, PersonalRecord> {
  const best = new Map<string, PersonalRecord>();

  for (const exercise of session.recordedExercises) {
    if (exercise.type !== 'RecordedWeightedExercise' || !exercise.isStarted) {
      continue;
    }

    // Same key selectRecentlyCompletedExercises uses; it already guards the cardio/weighted name collision.
    const key = NormalizedName.fromExerciseBlueprint(exercise.blueprint).toString();

    for (const potentialSet of exercise.potentialSets) {
      if (!potentialSet.set?.repsCompleted) {
        continue;
      }
      const oneRepMax = calculateOneRepMax(potentialSet, exercise.effectiveWeight(potentialSet, session.bodyweight));
      const current = best.get(key);
      if (!current || oneRepMax.isGreaterThan(current.oneRepMax)) {
        best.set(key, { exerciseName: exercise.blueprint.name, oneRepMax });
      }
    }
  }

  return best;
}

/**
 * Records per session, walking oldest to newest with a running best per exercise.
 *
 * A record only counts if the exercise was seen in an *earlier* session — otherwise the first time anyone
 * lifts anything is a PR, and a user with a single event in your feed gets a badge on everything they do.
 */
export function findPersonalRecords(sessionsOldestFirst: Session[]): Map<string, PersonalRecord[]> {
  const runningBest = new Map<string, Weight>();
  const recordsBySession = new Map<string, PersonalRecord[]>();

  for (const session of sessionsOldestFirst) {
    const records: PersonalRecord[] = [];

    for (const [key, candidate] of bestOneRepMax(session)) {
      const previous = runningBest.get(key);

      if (previous && candidate.oneRepMax.isGreaterThan(previous)) {
        records.push(candidate);
      }

      if (!previous || candidate.oneRepMax.isGreaterThan(previous)) {
        runningBest.set(key, candidate.oneRepMax);
      }
    }

    if (records.length > 0) {
      recordsBySession.set(session.id, records);
    }
  }

  return recordsBySession;
}

import { NormalizedName } from '@/models/blueprint-models';
import { TemporalComparer } from '@/models/comparers';
import { RecordedWeightedExercise, Session } from '@/models/session-models';
import { Weight } from '@/models/weight';
import { ZoneId } from '@js-joda/core';
import Enumerable from 'linq';

export type PersonalBestKind =
  | 'workoutVolume'
  | 'exerciseVolume'
  | 'weight'
  | 'repsAtWeight';

export interface PersonalBest {
  kind: PersonalBestKind;
  exerciseName?: string;
  weight?: Weight;
  reps?: number;
  value: Weight | number;
  previousValue?: Weight | number;
}

export interface PersonalBestSummary {
  personalBests: PersonalBest[];
  previousSessionsCount: number;
}

interface ExerciseSessionAggregate {
  exerciseName: string;
  maxWeight: Weight | undefined;
  volume: Weight;
  repsAtWeight: Map<string, { reps: number; weight: Weight }>;
}

function getWeightKey(weight: Weight): string {
  return weight.convertTo('kilograms').value.decimalPlaces(4).toString();
}

function getChronologicalPoint(session: Session) {
  return (
    session.lastExercise?.latestTime ??
    session.date
      .atStartOfDay()
      .atZone(ZoneId.systemDefault())
      .toOffsetDateTime()
  );
}

function isSessionBefore(a: Session, b: Session) {
  if (a.date.isBefore(b.date)) {
    return true;
  }
  if (a.date.isAfter(b.date)) {
    return false;
  }

  return (
    TemporalComparer(getChronologicalPoint(a), getChronologicalPoint(b)) < 0
  );
}

function aggregateSessionExercises(session: Session) {
  const perExercise = new Map<string, ExerciseSessionAggregate>();

  for (const exercise of session.recordedExercises) {
    if (
      !(exercise instanceof RecordedWeightedExercise) ||
      !exercise.isStarted
    ) {
      continue;
    }

    const key = NormalizedName.fromExerciseBlueprint(
      exercise.blueprint,
    ).toString();
    const existing =
      perExercise.get(key) ??
      ({
        exerciseName: exercise.blueprint.name,
        maxWeight: undefined,
        volume: Weight.NIL,
        repsAtWeight: new Map<string, { reps: number; weight: Weight }>(),
      } satisfies ExerciseSessionAggregate);

    for (const set of exercise.potentialSets) {
      if (!set.set) {
        continue;
      }

      existing.maxWeight =
        !existing.maxWeight || set.weight.isGreaterThan(existing.maxWeight)
          ? set.weight
          : existing.maxWeight;
      existing.volume = existing.volume.plus(
        set.weight.multipliedBy(set.set.repsCompleted),
      );

      const weightKey = getWeightKey(set.weight);
      const currentRepPb = existing.repsAtWeight.get(weightKey);
      if (!currentRepPb || set.set.repsCompleted > currentRepPb.reps) {
        existing.repsAtWeight.set(weightKey, {
          reps: set.set.repsCompleted,
          weight: set.weight,
        });
      }
    }

    perExercise.set(key, existing);
  }

  return perExercise;
}

export function calculatePersonalBests(
  session: Session,
  allSessions: Session[],
): PersonalBestSummary {
  const previousSessions = allSessions.filter(
    (other) => other.id !== session.id && isSessionBefore(other, session),
  );

  let previousWorkoutVolume: Weight | undefined;
  const previousExerciseVolume = new Map<string, Weight>();
  const previousExerciseWeight = new Map<string, Weight>();
  const previousRepsAtWeight = new Map<string, number>();

  for (const previousSession of previousSessions) {
    previousWorkoutVolume =
      !previousWorkoutVolume ||
      previousSession.totalWeightLifted.isGreaterThan(previousWorkoutVolume)
        ? previousSession.totalWeightLifted
        : previousWorkoutVolume;

    const aggregates = aggregateSessionExercises(previousSession);
    for (const [exerciseKey, aggregate] of aggregates.entries()) {
      const previousVolume = previousExerciseVolume.get(exerciseKey);
      if (!previousVolume || aggregate.volume.isGreaterThan(previousVolume)) {
        previousExerciseVolume.set(exerciseKey, aggregate.volume);
      }

      if (
        aggregate.maxWeight &&
        (!previousExerciseWeight.get(exerciseKey) ||
          aggregate.maxWeight.isGreaterThan(
            previousExerciseWeight.get(exerciseKey)!,
          ))
      ) {
        previousExerciseWeight.set(exerciseKey, aggregate.maxWeight);
      }

      for (const [weightKey, repPb] of aggregate.repsAtWeight.entries()) {
        const repsKey = `${exerciseKey}::${weightKey}`;
        const previousReps = previousRepsAtWeight.get(repsKey);
        if (previousReps === undefined || repPb.reps > previousReps) {
          previousRepsAtWeight.set(repsKey, repPb.reps);
        }
      }
    }
  }

  const personalBests: PersonalBest[] = [];
  if (
    previousWorkoutVolume === undefined ||
    session.totalWeightLifted.isGreaterThan(previousWorkoutVolume)
  ) {
    personalBests.push({
      kind: 'workoutVolume',
      value: session.totalWeightLifted,
      ...(previousWorkoutVolume
        ? { previousValue: previousWorkoutVolume }
        : undefined),
    });
  }

  const currentAggregates = aggregateSessionExercises(session);
  for (const [exerciseKey, aggregate] of currentAggregates.entries()) {
    const previousVolume = previousExerciseVolume.get(exerciseKey);
    if (
      previousVolume === undefined ||
      aggregate.volume.isGreaterThan(previousVolume)
    ) {
      personalBests.push({
        kind: 'exerciseVolume',
        exerciseName: aggregate.exerciseName,
        value: aggregate.volume,
        ...(previousVolume ? { previousValue: previousVolume } : undefined),
      });
    }

    if (
      aggregate.maxWeight &&
      (!previousExerciseWeight.get(exerciseKey) ||
        aggregate.maxWeight.isGreaterThan(
          previousExerciseWeight.get(exerciseKey)!,
        ))
    ) {
      const previousExerciseMaxWeight = previousExerciseWeight.get(exerciseKey);
      personalBests.push({
        kind: 'weight',
        exerciseName: aggregate.exerciseName,
        value: aggregate.maxWeight,
        ...(previousExerciseMaxWeight
          ? { previousValue: previousExerciseMaxWeight }
          : undefined),
      });
    }

    for (const [weightKey, repPb] of aggregate.repsAtWeight.entries()) {
      const previousReps = previousRepsAtWeight.get(
        `${exerciseKey}::${weightKey}`,
      );
      if (previousReps === undefined || repPb.reps > previousReps) {
        personalBests.push({
          kind: 'repsAtWeight',
          exerciseName: aggregate.exerciseName,
          reps: repPb.reps,
          weight: repPb.weight,
          value: repPb.reps,
          ...(previousReps !== undefined
            ? { previousValue: previousReps }
            : undefined),
        });
      }
    }
  }

  const order: Record<PersonalBestKind, number> = {
    workoutVolume: 0,
    exerciseVolume: 1,
    weight: 2,
    repsAtWeight: 3,
  };

  return {
    previousSessionsCount: previousSessions.length,
    personalBests: Enumerable.from(personalBests)
      .orderBy((x) => order[x.kind])
      .thenBy((x) => x.exerciseName ?? '')
      .thenBy((x) =>
        x.weight ? x.weight.convertTo('kilograms').value.toString() : '',
      )
      .toArray(),
  };
}

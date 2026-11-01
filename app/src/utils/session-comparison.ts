import { MovementKey } from '@/models/blueprint-models';
import { RecordedWeightedExercise, Session } from '@/models/session-models';
import { Weight } from '@/models/weight';
import BigNumber from 'bignumber.js';

export type ExerciseMeasure =
  | { kind: 'volume'; current: Weight; previous: Weight | undefined }
  | { kind: 'reps'; current: number; previous: number | undefined };

export type ExerciseChange =
  | { kind: 'better' | 'worse'; amount: BigNumber }
  | { kind: 'same' | 'new' | 'skipped' | 'pending' };

export interface ExerciseComparison {
  key: MovementKey;
  name: string;
  exercises: RecordedWeightedExercise[];
  measure: ExerciseMeasure;
  change: ExerciseChange;
}

interface ExerciseTotals {
  name: string;
  exercises: RecordedWeightedExercise[];
  usesReps: boolean;
  completedSets: number;
  volume: Weight;
  reps: number;
}

function totalsOf(session: Session) {
  const totals = new Map<MovementKey, ExerciseTotals>();
  for (const exercise of session.recordedExercises) {
    if (!(exercise instanceof RecordedWeightedExercise)) {
      continue;
    }
    const key = exercise.movementKey();
    const existing = totals.get(key);
    totals.set(key, {
      name: existing?.name ?? exercise.blueprint.name,
      exercises: [...(existing?.exercises ?? []), exercise],
      usesReps: existing?.usesReps ?? exercise.blueprint.resistance !== 'external',
      completedSets: (existing?.completedSets ?? 0) + exercise.completedSetCount,
      volume: (existing?.volume ?? Weight.NIL).plus(exercise.totalWeightLifted),
      reps: (existing?.reps ?? 0) + exercise.potentialSets.reduce((sum, x) => sum + (x.set?.repsCompleted ?? 0), 0),
    });
  }
  return totals;
}

function changeOf(current: ExerciseTotals, previous: ExerciseTotals | undefined, inProgress: boolean): ExerciseChange {
  if (!current.completedSets) {
    return { kind: inProgress ? 'pending' : 'skipped' };
  }
  if (!previous?.completedSets) {
    return { kind: 'new' };
  }
  if (current.usesReps) {
    const difference = current.reps - previous.reps;
    return difference === 0
      ? { kind: 'same' }
      : { kind: difference > 0 ? 'better' : 'worse', amount: new BigNumber(difference).abs() };
  }
  const previousVolume = previous.volume.convertTo(current.volume.unit).value;
  if (previousVolume.isZero()) {
    return { kind: 'same' };
  }
  const percentage = current.volume.value
    .minus(previousVolume)
    .multipliedBy(100)
    .dividedBy(previousVolume)
    .decimalPlaces(0);
  if (percentage.isZero()) {
    return { kind: 'same' };
  }
  return { kind: percentage.isPositive() ? 'better' : 'worse', amount: percentage.abs() };
}

export function compareExercises(
  session: Session,
  previousSession: Session | undefined,
  inProgress: boolean,
): ExerciseComparison[] {
  const previousTotals = previousSession ? totalsOf(previousSession) : new Map<MovementKey, ExerciseTotals>();
  return [...totalsOf(session).entries()].map(([key, current]) => {
    const previous = previousTotals.get(key);
    return {
      key,
      name: current.name,
      exercises: current.exercises,
      measure: current.usesReps
        ? { kind: 'reps', current: current.reps, previous: previous?.completedSets ? previous.reps : undefined }
        : {
            kind: 'volume',
            current: current.volume,
            previous: previous?.completedSets ? previous.volume : undefined,
          },
      change: changeOf(current, previous, inProgress),
    };
  });
}

export function plannedSetCount(session: Session): number {
  return session.recordedExercises.reduce(
    (total, x) => total + (x instanceof RecordedWeightedExercise ? x.potentialSets.length : x.sets.length),
    0,
  );
}

import { RecordedWeightedExercise, Session } from '@/models/session-models';
import { Weight } from '@/models/weight';
import BigNumber from 'bignumber.js';
import { match } from 'ts-pattern';

export type DeloadStyle = 'lighterWeight' | 'fewerSets' | 'unchanged';

export interface DeloadSettings {
  style: DeloadStyle;
  weightPercent: number;
  setsPercent: number;
}

export function snapToStep(value: BigNumber, step: BigNumber): BigNumber {
  if (step.isLessThanOrEqualTo(0)) {
    return value;
  }
  return value.dividedBy(step).integerValue(BigNumber.ROUND_HALF_UP).multipliedBy(step);
}

export function deloadSetCount(sets: number, percent: number): number {
  return Math.max(1, Math.ceil((sets * percent) / 100));
}

function withSetsKept(exercise: RecordedWeightedExercise, count: number): RecordedWeightedExercise {
  let unloggedSetsToKeep = Math.max(1, count) - exercise.completedSetCount;
  return exercise.with({
    potentialSets: exercise.potentialSets.filter((set) => set.isComplete || unloggedSetsToKeep-- > 0),
  });
}

function liftsNoWeight(exercise: RecordedWeightedExercise): boolean {
  return !exercise.tracksResistance || exercise.potentialSets.every((set) => set.weight.value.isLessThanOrEqualTo(0));
}

function lighterWeight(weight: Weight, percent: number, step: BigNumber): Weight {
  if (weight.value.isLessThanOrEqualTo(0)) {
    return weight;
  }
  return weight.with({ value: snapToStep(weight.value.multipliedBy(percent).dividedBy(100), step) });
}

export function deloadExercise(exercise: RecordedWeightedExercise, settings: DeloadSettings): RecordedWeightedExercise {
  const setCount = exercise.potentialSets.length;
  return match(settings.style)
    .with('unchanged', () => exercise)
    .with('fewerSets', () => withSetsKept(exercise, deloadSetCount(setCount, settings.setsPercent)))
    .with('lighterWeight', () =>
      liftsNoWeight(exercise)
        ? withSetsKept(exercise, setCount - 1)
        : exercise.withAllSets((set) =>
            set.isComplete
              ? set
              : set.with({
                  weight: lighterWeight(set.weight, settings.weightPercent, exercise.blueprint.weightIncrement),
                }),
          ),
    )
    .exhaustive();
}

export function deloadSession(session: Session, settings: DeloadSettings): Session {
  if (session.deload) {
    return session;
  }
  return session.with({
    deload: true,
    recordedExercises: session.recordedExercises.map((exercise) =>
      exercise instanceof RecordedWeightedExercise ? deloadExercise(exercise, settings) : exercise,
    ),
  });
}

/** Puts back the sets the plan asks for, keeping every logged set as it was performed. */
export function restoreNormalExercise(
  exercise: RecordedWeightedExercise,
  normal: RecordedWeightedExercise,
): RecordedWeightedExercise {
  const setCount = Math.max(exercise.potentialSets.length, normal.potentialSets.length);
  return exercise.with({
    potentialSets: Array.from({ length: setCount }, (_, index) => {
      const current = exercise.potentialSets[index];
      return current?.isComplete ? current : (normal.potentialSets[index] ?? current!);
    }),
  });
}

export type DeloadDifference = { type: 'weight'; normal: Weight } | { type: 'sets'; normal: number };

/** What a deload exercise lightened, compared with the exercise the plan would normally have asked for. */
export function deloadDifference(
  exercise: RecordedWeightedExercise,
  normal: RecordedWeightedExercise,
): DeloadDifference | undefined {
  const anySetLightened = exercise.potentialSets.some((set, index) => {
    const normalSet = normal.potentialSets[index];
    return normalSet !== undefined && !set.weight.equals(normalSet.weight, true);
  });
  if (anySetLightened) {
    return { type: 'weight', normal: normal.maxWeight };
  }
  if (exercise.potentialSets.length !== normal.potentialSets.length) {
    return { type: 'sets', normal: normal.potentialSets.length };
  }
  return undefined;
}

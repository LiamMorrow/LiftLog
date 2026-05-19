import {
  CardioExerciseBlueprint,
  ExerciseBlueprint,
  WeightedExerciseBlueprint,
} from '@/models/blueprint-models';
import { RecordedCardioExercise } from '@/models/session-models/recorded-cardio-exercise';
import { RecordedWeightedExercise } from '@/models/session-models/recorded-weighted-exercise';
import { RecordedExerciseJSON } from '@/models/storage/versions/latest';
import { WeightUnit } from '@/models/weight';
import { match, P } from 'ts-pattern';

export type RecordedExercise =
  | RecordedCardioExercise
  | RecordedWeightedExercise;

export function fromRecordedExerciseJSON(
  json: RecordedExerciseJSON,
): RecordedExercise {
  return match(json)
    .with({ type: 'RecordedCardioExercise' }, RecordedCardioExercise.fromJSON)
    .with(
      { type: 'RecordedWeightedExercise' },
      RecordedWeightedExercise.fromJSON,
    )
    .exhaustive();
}

export function createEmptyRecordedExercise(
  blueprint: ExerciseBlueprint,
  unit: WeightUnit,
) {
  return match(blueprint)
    .with(P.instanceOf(WeightedExerciseBlueprint), (b) =>
      RecordedWeightedExercise.empty(b, unit),
    )
    .with(P.instanceOf(CardioExerciseBlueprint), (b) =>
      RecordedCardioExercise.empty(b),
    )
    .exhaustive();
}

import {
  ExerciseBlueprint,
  WeightedExerciseBlueprint,
} from '@/models/blueprint-models';
import {
  RecordedExercise,
  RecordedWeightedExercise,
} from '@/models/session-models';

export function assertWeightedExercise(
  ex: RecordedExercise,
): asserts ex is RecordedWeightedExercise {
  if (!(ex instanceof RecordedWeightedExercise)) {
    throw new Error('Need to be weighted');
  }
}

export function assertWeightedExerciseBlueprint(
  ex: ExerciseBlueprint,
): asserts ex is WeightedExerciseBlueprint {
  if (!(ex instanceof WeightedExerciseBlueprint)) {
    throw new Error('Need to be weighted');
  }
}

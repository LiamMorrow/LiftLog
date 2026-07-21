import type { BigNumberJSON, DurationJSON, LocalDateJSON, OffsetDateTimeJSON } from '@/models/storage/versions/libs';
import type {
  WeightedExerciseBlueprintJSON,
  CardioExerciseBlueprintJSON,
  DistanceJSON,
  CardioExerciseSetBlueprintJSON,
} from '@/models/storage/versions/latest/blueprint';
import type { WeightJSON } from '@/models/storage/versions/libs/weight';

export interface SessionJSON {
  version: 3;
  id: string;
  blueprint: { name: string; notes: string };
  recordedExercises: RecordedExerciseJSON[];
  date: LocalDateJSON;
  bodyweight: WeightJSON | undefined;
}

/**
 * @discriminator type
 */
export type RecordedExerciseJSON = RecordedCardioExerciseJSON | RecordedWeightedExerciseJSON;

export interface RecordedCardioExerciseSetJSON {
  blueprint: CardioExerciseSetBlueprintJSON;
  completionDateTime?: OffsetDateTimeJSON | undefined;
  duration?: DurationJSON | undefined;
  distance?: DistanceJSON | undefined;
  resistance?: BigNumberJSON | undefined;
  incline?: BigNumberJSON | undefined;
  weight?: WeightJSON | undefined;
  /**
   * @asType integer
   */
  steps?: number | undefined;
}

export interface RecordedCardioExerciseJSON {
  type: 'RecordedCardioExercise';
  blueprint: CardioExerciseBlueprintJSON;
  sets: RecordedCardioExerciseSetJSON[];
  notes?: string | undefined;
}

export interface RecordedWeightedExerciseJSON {
  type: 'RecordedWeightedExercise';
  blueprint: WeightedExerciseBlueprintJSON;
  potentialSets: PotentialSetJSON[];
  notes?: string | undefined;
}

export interface RecordedSetJSON {
  /**
   * @asType integer
   */
  repsCompleted: number;
  completionDateTime: OffsetDateTimeJSON;
  /**
   * Peak power in whole watts achieved during the set, as reported by
   * equipment with a power readout (e.g. Keiser functional trainers).
   * @asType integer
   */
  power?: number | undefined;
}

export interface PotentialSetJSON {
  set?: RecordedSetJSON | undefined;
  weight: WeightJSON;
}

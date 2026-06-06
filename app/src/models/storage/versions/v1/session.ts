import { version } from './version';
import type {
  BigNumberJSON,
  DurationJSON,
  LocalDateJSON,
  OffsetDateTimeJSON,
} from '../libs';
import type {
  WeightedExerciseBlueprintJSON,
  SessionBlueprintJSON,
  CardioExerciseBlueprintJSON,
  DistanceJSON,
  CardioExerciseSetBlueprintJSON,
} from './blueprint';
import type { WeightJSON } from '../libs/weight';

export interface SessionJSON {
  version?: typeof version;
  id: string;
  blueprint: SessionBlueprintJSON;
  recordedExercises: RecordedExerciseJSON[];
  date: LocalDateJSON;
  bodyweight: WeightJSON | undefined;
}

/**
 * @discriminator type
 */
export type RecordedExerciseJSON =
  | RecordedCardioExerciseJSON
  | RecordedWeightedExerciseJSON;

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
}

export interface PotentialSetJSON {
  set?: RecordedSetJSON | undefined;
  weight: WeightJSON;
}

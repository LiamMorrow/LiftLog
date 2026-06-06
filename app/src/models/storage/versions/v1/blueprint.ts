import { version } from './version';
import type { LocalDateJSON, DurationJSON, BigNumberJSON } from '../libs';

export interface ProgramBlueprintJSON {
  version?: typeof version;
  name: string;
  sessions: SessionBlueprintJSON[];
  lastEdited: LocalDateJSON;
}

export interface SessionBlueprintJSON {
  version?: typeof version;
  name: string;
  exercises: ExerciseBlueprintJSON[];
  notes: string;
}

/**
 * @discriminator type
 */
export type ExerciseBlueprintJSON =
  | WeightedExerciseBlueprintJSON
  | CardioExerciseBlueprintJSON;

export type DistanceUnitJSON = 'metre' | 'yard' | 'mile' | 'kilometre';

export type TimeCardioTargetJSON = {
  type: 'time';
  value: DurationJSON;
};

export type DistanceCardioTargetJSON = {
  type: 'distance';
  value: DistanceJSON;
};

export type DistanceJSON = {
  value: BigNumberJSON;
  unit: DistanceUnitJSON;
};

/**
 * @discriminator type
 */
export type CardioTargetJSON = TimeCardioTargetJSON | DistanceCardioTargetJSON;

export interface CardioExerciseSetBlueprintJSON {
  target: CardioTargetJSON;
  trackDuration: boolean;
  trackDistance: boolean;
  trackResistance: boolean;
  trackIncline: boolean;
  trackWeight: boolean;
  trackSteps: boolean;
}

export interface CardioExerciseBlueprintJSON {
  type: 'CardioExerciseBlueprint';
  name: string;
  sets: CardioExerciseSetBlueprintJSON[];
  notes: string;
  link: string;
}
export interface WeightedExerciseBlueprintJSON {
  type: 'WeightedExerciseBlueprint';
  name: string;
  /**
   * @asType integer
   */
  sets: number;
  /**
   * @asType integer
   */
  repsPerSet: number;
  weightIncreaseOnSuccess: BigNumberJSON;
  restBetweenSets: RestJSON;
  supersetWithNext: boolean;
  notes: string;
  link: string;
}

export interface RestJSON {
  version?: typeof version;
  minRest: DurationJSON;
  maxRest: DurationJSON;
  failureRest: DurationJSON;
}

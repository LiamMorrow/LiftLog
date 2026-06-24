import {
  type LocalDateJSON,
  type DurationJSON,
  type BigNumberJSON,
} from '../libs';

export interface ProgramBlueprintJSON {
  name: string;
  sessions: SessionBlueprintJSON[];
  lastEdited: LocalDateJSON;
}

export interface SessionBlueprintJSON {
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

type TimeCardioTargetJSON = {
  type: 'time';
  value: DurationJSON;
};

type DistanceCardioTargetJSON = {
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
  minRest: DurationJSON;
  maxRest: DurationJSON;
  failureRest: DurationJSON;
}

export interface NoProgressiveOverloadJSON {
  readonly type: 'NoProgressiveOverload';
}

export interface IncreaseAllEvenlyProgressiveOverloadJSON {
  readonly type: 'IncreaseAllEvenlyProgressiveOverload';
  readonly amount: BigNumberJSON;
}

type IncreaseStrategyJSON = 'first' | 'middle' | 'last' | 'all';

export interface IncreaseLowestSetProgressiveOverloadJSON {
  readonly type: 'IncreaseLowestSetProgressiveOverload';
  readonly amount: BigNumberJSON;
  readonly increaseStrategy: IncreaseStrategyJSON;
}

/**
 * @discriminator type
 */
export type ProgressiveOverloadJSON =
  | NoProgressiveOverloadJSON
  | IncreaseAllEvenlyProgressiveOverloadJSON
  | IncreaseLowestSetProgressiveOverloadJSON;

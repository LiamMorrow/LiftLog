import type { LocalDateJSON, DurationJSON, BigNumberJSON } from '@/models/storage/versions/libs';

export interface ProgramBlueprintJSON {
  version: 3;
  /**
   * Name of the workout program; typically matches the plan name.
   */
  name: string;
  sessions: SessionBlueprintJSON[];
  lastEdited: LocalDateJSON;
}

export interface SessionBlueprintJSON {
  version: 5;
  name: string;
  exercises: ExerciseBlueprintJSON[];
  notes: string;
}

/**
 * @discriminator type
 */
export type ExerciseBlueprintJSON = WeightedExerciseBlueprintJSON | CardioExerciseBlueprintJSON;

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
  /** Absent when the set has no rest - steady-state cardio does not need one. */
  restBetweenSets?: RestJSON | undefined;
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
  /** What the plan asks for, one entry per set. */
  plannedSets: PlannedSetJSON[];
  restBetweenSets: RestJSON;
  /**
   * When true, this exercise is performed back-to-back with the following one
   * (a superset), with no rest in between.
   */
  supersetWithNext: boolean;
  notes: string;
  /**
   * A url to some explanation of how to do this.
   * We should not fill this unless the user has explicitly given us a link to fill
   */
  link: string;
  progressiveOverload: ProgressiveOverloadJSON;
  /**
   * Where this movement's load comes from: the whole stored weight (`external`), what is added on
   * top of the lifter (`bodyweight`), or nothing at all (`none`, e.g. crunches).
   */
  loadBasis: LoadBasisJSON;
}

export type LoadBasisJSON = 'none' | 'external' | 'bodyweight';

/** What the plan asks for on one set. */
export interface PlannedSetJSON {
  reps: RepsTargetJSON;
}

/** Always a band; `min === max` is a point target. */
export interface RepsTargetJSON {
  /**
   * @asType integer
   */
  min: number;
  /**
   * @asType integer
   */
  max: number;
}

export interface RestJSON {
  minRest: DurationJSON;
  maxRest: DurationJSON;
  /**
   * Rest taken after a set where the user failed to hit their target reps.
   */
  failureRest: DurationJSON;
}

/**
 * Used when the user does not want progressive overload at all. Potentially with bodyweight exercises.
 */
export interface NoProgressiveOverloadJSON {
  readonly type: 'NoProgressiveOverload';
}
/**
 * The standard "increase every set across the board" progressive overload. Usually 2.5kg, or 5lb.
 */
export interface IncreaseAllEvenlyProgressiveOverloadJSON {
  readonly type: 'IncreaseAllEvenlyProgressiveOverload';
  readonly amount: BigNumberJSON;
}

type IncreaseStrategyJSON = 'first' | 'middle' | 'last' | 'all';

/**
 * A more complex progressive overload which allows the user to increase only a single set,
 * or all sets which have the lowest weight.
 *
 * A user might want to increase the middle weight for exercises where going up
 * across the board would be too much e.g. lateral raises, or other shoulder exercises
 */
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

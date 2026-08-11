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
  version: 6;
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
  /** Ordered; the first rule that can still move, moves. Empty means no automatic progression. */
  progression: ProgressionRuleJSON[];
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

/** Which number a rule moves. */
export type ProgressionAxisJSON = 'reps' | 'load';

export interface AllSetsScopeJSON {
  readonly type: 'allSets';
}

/** Ranks by the rule's own axis, so a reps rule picks the smallest target rather than the smallest weight. */
export interface LowestSetsScopeJSON {
  readonly type: 'lowestSets';
  readonly pick: 'first' | 'middle' | 'last' | 'all';
}

/**
 * Which sets a rule moves.
 *
 * @discriminator type
 */
export type SetScopeJSON = AllSetsScopeJSON | LowestSetsScopeJSON;

/** What has to happen for a rule to fire. */
export type SuccessRuleJSON = 'allSetsMetTarget';

/**
 * One step of automatic progression. An exercise carries an ordered list of these, and the first
 * rule that can still move is the one that moves.
 *
 * `step` and `ceiling` are in the axis's own unit - whole reps, or plate increments in whatever unit
 * the lifter works in. Deliberately not a weight: 2.5 in a kilogram gym and 5 in a pound gym are the
 * same step, not conversions of one another, and a blueprint has no unit to be expressed in.
 */
export interface ProgressionRuleJSON {
  readonly axis: ProgressionAxisJSON;
  readonly step: BigNumberJSON;
  readonly scope: SetScopeJSON;
  /** Where the axis stops climbing. Above this the rule can no longer move, so the next one is tried. */
  readonly ceiling?: BigNumberJSON;
  /** Drop the axis back to what the plan asks for once a later rule fires. */
  readonly onCeiling?: 'reset';
  readonly trigger: SuccessRuleJSON;
}

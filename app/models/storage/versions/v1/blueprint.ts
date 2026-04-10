import type { LocalDateJSON, DurationJSON, BigNumberJSON } from '../libs';

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
  sets: number;
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

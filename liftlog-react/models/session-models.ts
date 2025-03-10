import { ExerciseBlueprint, SessionBlueprint } from '@/models/blueprint-models';
import { LocalDate, LocalTime } from '@js-joda/core';
import BigNumber from 'bignumber.js';

export interface Session {
  readonly id: string;
  readonly blueprint: SessionBlueprint;
  readonly recordedExercises: readonly RecordedExercise[];
  readonly date: LocalDate;
  readonly bodyweight: BigNumber;
}

export interface RecordedExercise {
  readonly blueprint: ExerciseBlueprint;
  readonly potentialSets: readonly PotentialSet[];
  readonly notes: string | undefined;
  readonly perSetWeight: boolean;
}

export interface RecordedSet {
  readonly repsCompleted: number;
  readonly completionTime: LocalTime;
}

export interface PotentialSet {
  readonly set: RecordedSet | undefined;
  readonly weight: BigNumber;
}

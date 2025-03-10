import { Duration, LocalDate } from '@js-joda/core';
import BigNumber from 'bignumber.js';

export interface ProgramBlueprint {
  readonly name: string;
  readonly sessions: readonly SessionBlueprint[];
  lastEdited: LocalDate;
}

export interface SessionBlueprint {
  readonly name: string;
  readonly exercises: readonly ExerciseBlueprint[];
  notes: string;
}

export interface Rest {
  readonly minRest: Duration;
  readonly maxRest: Duration;
  readonly failureRest: Duration;
}

export const Rest = {
  short: {
    minRest: Duration.ofSeconds(60),
    maxRest: Duration.ofSeconds(90),
    failureRest: Duration.ofSeconds(180),
  },
  medium: {
    minRest: Duration.ofSeconds(90),
    maxRest: Duration.ofSeconds(180),
    failureRest: Duration.ofSeconds(300),
  },
  long: {
    minRest: Duration.ofMinutes(3),
    maxRest: Duration.ofMinutes(5),
    failureRest: Duration.ofMinutes(8),
  },
} as const;

export interface ExerciseBlueprint {
  readonly name: string;
  readonly sets: number;
  readonly repsPerSet: number;
  readonly weightIncreaseOnSuccess: BigNumber;
  readonly restBetweenSets: Rest;
  readonly supersetWithNext: boolean;
  readonly notes: string;
  readonly link: string;
}

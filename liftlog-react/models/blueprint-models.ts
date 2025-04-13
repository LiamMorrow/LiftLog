import { Duration, LocalDate } from '@js-joda/core';
import BigNumber from 'bignumber.js';

export interface ProgramBlueprint {
  readonly name: string;
  readonly sessions: SessionBlueprint[];
  lastEdited: LocalDate;
}

export interface SessionBlueprint {
  name: string;
  exercises: ExerciseBlueprint[];
  notes: string;
}

export interface Rest {
  minRest: Duration;
  maxRest: Duration;
  failureRest: Duration;
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
  name: string;
  sets: number;
  repsPerSet: number;
  weightIncreaseOnSuccess: BigNumber;
  restBetweenSets: Rest;
  supersetWithNext: boolean;
  notes: string;
  link: string;
}

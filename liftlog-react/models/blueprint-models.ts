import { Duration, LocalDate } from '@js-joda/core';
import BigNumber from 'bignumber.js';

export interface ProgramBlueprintPOJO {
  _BRAND: 'PROGRAM_BLUEPRINT_POJO';
  readonly name: string;
  readonly sessions: SessionBlueprintPOJO[];
  lastEdited: LocalDate;
}

export class ProgramBlueprint {
  readonly name: string;
  readonly sessions: SessionBlueprint[];
  lastEdited: LocalDate;

  /**
   * @deprecated please use full constructor. Here only for serialization
   */
  constructor();
  constructor(
    name: string,
    sessions: SessionBlueprint[],
    lastEdited: LocalDate,
  );
  constructor(
    name?: string,
    sessions?: SessionBlueprint[],
    lastEdited?: LocalDate,
  ) {
    this.name = name!;
    this.sessions = sessions!;
    this.lastEdited = lastEdited!;
  }

  static fromPOJO(
    pojo: Omit<ProgramBlueprintPOJO, '_BRAND'>,
  ): ProgramBlueprint {
    return new ProgramBlueprint(
      pojo.name,
      pojo.sessions.map(SessionBlueprint.fromPOJO),
      pojo.lastEdited,
    );
  }

  equals(other: ProgramBlueprint | undefined) {
    if (!other) {
      return false;
    }
    if (other === this) {
      return true;
    }

    return (
      this.name === other.name &&
      this.lastEdited.equals(other.lastEdited) &&
      this.sessions.length === other.sessions.length &&
      this.sessions.every((session, index) =>
        session.equals(other.sessions[index]),
      )
    );
  }

  toPOJO(): ProgramBlueprintPOJO {
    return {
      _BRAND: 'PROGRAM_BLUEPRINT_POJO',
      name: this.name,
      sessions: this.sessions.map((session) => session.toPOJO()),
      lastEdited: this.lastEdited,
    };
  }

  with(other: Partial<ProgramBlueprintPOJO>): ProgramBlueprint {
    return new ProgramBlueprint(
      other.name ?? this.name,
      other.sessions
        ? other.sessions.map(SessionBlueprint.fromPOJO)
        : this.sessions,
      other.lastEdited ?? this.lastEdited,
    );
  }
}

export interface SessionBlueprintPOJO {
  _BRAND: 'SESSION_BLUEPRINT_POJO';
  name: string;
  exercises: ExerciseBlueprintPOJO[];
  notes: string;
}

export class SessionBlueprint {
  readonly name: string;
  readonly exercises: ExerciseBlueprint[];
  readonly notes: string;

  /**
   * @deprecated please use full constructor. Here only for serialization
   */
  constructor();
  constructor(name: string, exercises: ExerciseBlueprint[], notes: string);
  constructor(name?: string, exercises?: ExerciseBlueprint[], notes?: string) {
    this.name = name!;
    this.exercises = exercises!;
    this.notes = notes!;
  }

  static fromPOJO(
    pojo: Omit<SessionBlueprintPOJO, '_BRAND'>,
  ): SessionBlueprint {
    return new SessionBlueprint(
      pojo.name,
      pojo.exercises.map(ExerciseBlueprint.fromPOJO),
      pojo.notes,
    );
  }

  equals(other: SessionBlueprint | undefined) {
    if (!other) {
      return false;
    }
    if (other === this) {
      return true;
    }

    return (
      this.name === other.name &&
      this.notes === other.notes &&
      this.exercises.length === other.exercises.length &&
      this.exercises.every((exercise, index) =>
        exercise.equals(other.exercises[index]),
      )
    );
  }

  toPOJO(): SessionBlueprintPOJO {
    return {
      _BRAND: 'SESSION_BLUEPRINT_POJO',
      name: this.name,
      exercises: this.exercises.map((exercise) => exercise.toPOJO()),
      notes: this.notes,
    };
  }

  with(other: Partial<SessionBlueprintPOJO>): SessionBlueprint {
    return new SessionBlueprint(
      other.name ?? this.name,
      other.exercises
        ? other.exercises.map(ExerciseBlueprint.fromPOJO)
        : this.exercises,
      other.notes ?? this.notes,
    );
  }
}

export interface ExerciseBlueprintPOJO {
  _BRAND: 'EXERCISE_BLUEPRINT_POJO';
  name: string;
  sets: number;
  repsPerSet: number;
  weightIncreaseOnSuccess: BigNumber;
  restBetweenSets: Rest;
  supersetWithNext: boolean;
  notes: string;
  link: string;
}

export class ExerciseBlueprint {
  readonly name: string;
  readonly sets: number;
  readonly repsPerSet: number;
  readonly weightIncreaseOnSuccess: BigNumber;
  readonly restBetweenSets: Rest;
  readonly supersetWithNext: boolean;
  readonly notes: string;
  readonly link: string;

  /**
   * @deprecated please use full constructor. Here only for serialization
   */
  constructor();
  constructor(
    name: string,
    sets: number,
    repsPerSet: number,
    weightIncreaseOnSuccess: BigNumber,
    restBetweenSets: Rest,
    supersetWithNext: boolean,
    notes: string,
    link: string,
  );
  constructor(
    name?: string,
    sets?: number,
    repsPerSet?: number,
    weightIncreaseOnSuccess?: BigNumber,
    restBetweenSets?: Rest,
    supersetWithNext?: boolean,
    notes?: string,
    link?: string,
  ) {
    this.name = name!;
    this.sets = sets!;
    this.repsPerSet = repsPerSet!;
    this.weightIncreaseOnSuccess = weightIncreaseOnSuccess!;
    this.restBetweenSets = restBetweenSets!;
    this.supersetWithNext = supersetWithNext!;
    this.notes = notes!;
    this.link = link!;
  }

  static fromPOJO(
    pojo: Omit<ExerciseBlueprintPOJO, '_BRAND'>,
  ): ExerciseBlueprint {
    return new ExerciseBlueprint(
      pojo.name,
      pojo.sets,
      pojo.repsPerSet,
      pojo.weightIncreaseOnSuccess,
      pojo.restBetweenSets,
      pojo.supersetWithNext,
      pojo.notes,
      pojo.link,
    );
  }

  equals(other: ExerciseBlueprint | undefined) {
    if (!other) {
      return false;
    }
    if (other === this) {
      return true;
    }

    return (
      this.name === other.name &&
      this.sets === other.sets &&
      this.repsPerSet === other.repsPerSet &&
      this.weightIncreaseOnSuccess.isEqualTo(other.weightIncreaseOnSuccess) &&
      this.restBetweenSets.minRest.equals(other.restBetweenSets.minRest) &&
      this.restBetweenSets.maxRest.equals(other.restBetweenSets.maxRest) &&
      this.restBetweenSets.failureRest.equals(
        other.restBetweenSets.failureRest,
      ) &&
      this.supersetWithNext === other.supersetWithNext &&
      this.notes === other.notes &&
      this.link === other.link
    );
  }

  toPOJO(): ExerciseBlueprintPOJO {
    return {
      _BRAND: 'EXERCISE_BLUEPRINT_POJO',
      name: this.name,
      sets: this.sets,
      repsPerSet: this.repsPerSet,
      weightIncreaseOnSuccess: this.weightIncreaseOnSuccess,
      restBetweenSets: this.restBetweenSets,
      supersetWithNext: this.supersetWithNext,
      notes: this.notes,
      link: this.link,
    };
  }

  with(other: Partial<ExerciseBlueprintPOJO>): ExerciseBlueprint {
    return new ExerciseBlueprint(
      other.name ?? this.name,
      other.sets ?? this.sets,
      other.repsPerSet ?? this.repsPerSet,
      other.weightIncreaseOnSuccess ?? this.weightIncreaseOnSuccess,
      other.restBetweenSets ?? this.restBetweenSets,
      other.supersetWithNext ?? this.supersetWithNext,
      other.notes ?? this.notes,
      other.link ?? this.link,
    );
  }
}

export class KeyedExerciseBlueprint {
  constructor(
    public name: string,
    public sets: number,
    public repsPerSet: number,
  ) {}

  static fromExerciseBlueprint(e: ExerciseBlueprint): KeyedExerciseBlueprint {
    return new KeyedExerciseBlueprint(e.name, e.sets, e.repsPerSet);
  }

  toString() {
    return `${this.name}_${this.sets}_${this.repsPerSet}`;
  }
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

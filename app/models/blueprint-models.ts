import { DeepOmit } from '@/utils/deep-omit';
import { Duration, LocalDate } from '@js-joda/core';
import BigNumber from 'bignumber.js';
import { match, P } from 'ts-pattern';

export interface ProgramBlueprintPOJO {
  type: 'ProgramBlueprint';
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

  static fromPOJO(pojo: Omit<ProgramBlueprintPOJO, 'type'>): ProgramBlueprint {
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
      type: 'ProgramBlueprint',
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
  type: 'SessionBlueprint';
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

  static fromPOJO(pojo: Omit<SessionBlueprintPOJO, 'type'>): SessionBlueprint {
    return new SessionBlueprint(
      pojo.name,
      pojo.exercises.map(fromExerciseBlueprintPOJO),
      pojo.notes,
    );
  }

  equals(other: SessionBlueprint | SessionBlueprintPOJO | undefined) {
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
      type: 'SessionBlueprint',
      name: this.name,
      exercises: this.exercises.map((exercise) => exercise.toPOJO()),
      notes: this.notes,
    };
  }

  with(
    other: Partial<SessionBlueprintPOJO | SessionBlueprint>,
  ): SessionBlueprint {
    return new SessionBlueprint(
      other.name ?? this.name,
      other.exercises
        ? other.exercises.map(fromExerciseBlueprintPOJO)
        : this.exercises,
      other.notes ?? this.notes,
    );
  }
}

export type ExerciseBlueprint =
  | WeightedExerciseBlueprint
  | CardioExerciseBlueprint;

export type ExerciseBlueprintPOJO =
  | WeightedExerciseBlueprintPOJO
  | CardioExerciseBlueprintPOJO;

export function fromExerciseBlueprintPOJO(
  pojo: ExerciseBlueprintPOJO | ExerciseBlueprint,
): ExerciseBlueprint {
  return match(pojo)
    .with(
      P.union(
        { type: 'CardioExerciseBlueprint' },
        P.instanceOf(CardioExerciseBlueprint),
      ),
      CardioExerciseBlueprint.fromPOJO,
    )
    .with(
      P.union(
        { type: 'WeightedExerciseBlueprint' },
        P.instanceOf(WeightedExerciseBlueprint),
      ),
      WeightedExerciseBlueprint.fromPOJO,
    )
    .exhaustive();
}

export const DistanceUnits = ['metre', 'yard', 'mile', 'kilometre'] as const;
export type DistanceUnit = (typeof DistanceUnits)[number];

export type TimeCardioTarget = {
  type: 'time';
  value: Duration;
};

export type DistanceCardioTarget = {
  type: 'distance';
  value: Distance;
};

export type Distance = {
  value: BigNumber;
  unit: DistanceUnit;
};

export type CardioTarget =
  | TimeCardioTarget
  | DistanceCardioTarget

export function matchCardioTarget<T>(
  value: CardioTarget,
  matcher: {
    [k in CardioTarget['type']]: (val: Extract<CardioTarget, { type: k }>) => T;
  },
) {
  return match(value)
    .with({ type: 'time' }, matcher.time)
    .with({ type: 'distance' }, matcher.distance)
    .exhaustive();
}

export interface CardioExerciseSetBlueprintPOJO {
  type: 'CardioExerciseSetBlueprint';

  readonly target: CardioTarget;
  readonly trackDuration: boolean;
  readonly trackDistance: boolean;
  readonly trackResistance: boolean;
  readonly trackIncline: boolean;
  readonly trackWeight: boolean;
  readonly trackSteps: boolean;
}

export class CardioExerciseSetBlueprint {
  constructor(
    readonly target: CardioTarget,
    readonly trackDuration: boolean,
    readonly trackDistance: boolean,
    readonly trackResistance: boolean,
    readonly trackIncline: boolean,
    readonly trackWeight: boolean,
    readonly trackSteps: boolean,
  ) {}
  static empty() {
    return new CardioExerciseSetBlueprint(
      {
        type: 'time',
        value: Duration.ofMinutes(30),
      },
      false,
      true,
      false,
      false,
      false,
      false,
    );
  }

  static fromPOJO(
    pojo: DeepOmit<CardioExerciseSetBlueprintPOJO, 'type'> &
      Pick<CardioExerciseSetBlueprintPOJO, 'target'>,
  ): CardioExerciseSetBlueprint {
    return new CardioExerciseSetBlueprint(
      pojo.target,
      pojo.trackDuration,
      pojo.trackDistance,
      pojo.trackResistance,
      pojo.trackIncline,
      pojo.trackWeight,
      pojo.trackSteps,
    );
  }

  toPOJO(): CardioExerciseSetBlueprintPOJO {
    return {
      type: 'CardioExerciseSetBlueprint',
      target: this.target,
      trackDistance: this.trackDistance,
      trackDuration: this.trackDuration,
      trackIncline: this.trackIncline,
      trackResistance: this.trackResistance,
      trackWeight: this.trackWeight,
      trackSteps: this.trackSteps,
    };
  }

  equals(
    other:
      | CardioExerciseSetBlueprint
      | CardioExerciseSetBlueprintPOJO
      | undefined,
  ): boolean {
    if (!other) {
      return false;
    }
    return (
      this.trackDistance === other.trackDistance &&
      this.trackDuration === other.trackDuration &&
      this.trackIncline === other.trackIncline &&
      this.trackResistance === other.trackResistance &&
      cardioTargetEquals(this.target, other.target)
    );
  }

  with(
    other:
      | Partial<CardioExerciseSetBlueprint>
      | Partial<CardioExerciseSetBlueprintPOJO>,
  ): CardioExerciseSetBlueprint {
    return new CardioExerciseSetBlueprint(
      other.target ?? this.target,
      other.trackDuration ?? this.trackDuration,
      other.trackDistance ?? this.trackDistance,
      other.trackResistance ?? this.trackResistance,
      other.trackIncline ?? this.trackIncline,
      other.trackWeight ?? this.trackWeight,
      other.trackSteps ?? this.trackSteps,
    );
  }
}

export interface CardioExerciseBlueprintPOJO {
  type: 'CardioExerciseBlueprint';
  name: string;
  sets: CardioExerciseSetBlueprintPOJO[];
  notes: string;
  link: string;
}
export class CardioExerciseBlueprint {
  constructor(
    readonly name: string,
    readonly sets: CardioExerciseSetBlueprint[],
    readonly notes: string,
    readonly link: string,
  ) {
    if (!sets.length) {
      throw new Error('Must have at least one set in cardio exercise');
    }
  }

  static empty() {
    return new CardioExerciseBlueprint(
      '',
      [CardioExerciseSetBlueprint.empty()],
      '',
      '',
    );
  }

  static fromPOJO(
    pojo: CardioExerciseBlueprintPOJO | CardioExerciseBlueprint,
  ): CardioExerciseBlueprint {
    return new CardioExerciseBlueprint(
      pojo.name,
      pojo.sets.map((x) => CardioExerciseSetBlueprint.fromPOJO(x)),
      pojo.notes,
      pojo.link,
    );
  }

  equals(other: ExerciseBlueprint | ExerciseBlueprintPOJO | undefined) {
    if (!other) {
      return false;
    }
    if (other === this) {
      return true;
    }
    if (
      other instanceof WeightedExerciseBlueprint ||
      ('type' in other && other.type === 'WeightedExerciseBlueprint')
    ) {
      return false;
    }
    return (
      this.name === other.name &&
      this.sets.length === other.sets.length &&
      this.sets.every((set, index) => set.equals(other.sets[index])) &&
      this.notes === other.notes &&
      this.link === other.link
    );
  }

  toPOJO(): CardioExerciseBlueprintPOJO {
    return {
      type: 'CardioExerciseBlueprint',
      name: this.name,
      sets: this.sets.map((x) => x.toPOJO()),
      notes: this.notes,
      link: this.link,
    };
  }

  with(other: Partial<CardioExerciseBlueprintPOJO>): CardioExerciseBlueprint {
    return new CardioExerciseBlueprint(
      other.name ?? this.name,
      other.sets?.map((x) => CardioExerciseSetBlueprint.fromPOJO(x)) ??
        this.sets,
      other.notes ?? this.notes,
      other.link ?? this.link,
    );
  }
}

export interface WeightedExerciseBlueprintPOJO {
  type: 'WeightedExerciseBlueprint';
  name: string;
  sets: number;
  repsPerSet: number;
  weightIncreaseOnSuccess: BigNumber;
  restBetweenSets: Rest;
  supersetWithNext: boolean;
  notes: string;
  link: string;
}

export class WeightedExerciseBlueprint {
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

  static empty() {
    return new WeightedExerciseBlueprint(
      '',
      3,
      10,
      BigNumber(0),
      Rest.medium,
      false,
      '',
      '',
    );
  }

  static fromPOJO(
    pojo: DeepOmit<WeightedExerciseBlueprintPOJO, 'type'>,
  ): WeightedExerciseBlueprint {
    return new WeightedExerciseBlueprint(
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

  equals(other: ExerciseBlueprint | ExerciseBlueprintPOJO | undefined) {
    if (!other) {
      return false;
    }
    if (other === this) {
      return true;
    }
    if (
      other instanceof CardioExerciseBlueprint ||
      ('type' in other && other.type === 'CardioExerciseBlueprint')
    ) {
      return false;
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

  toPOJO(): WeightedExerciseBlueprintPOJO {
    return {
      type: 'WeightedExerciseBlueprint',
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

  with(
    other: Partial<WeightedExerciseBlueprintPOJO>,
  ): WeightedExerciseBlueprint {
    return new WeightedExerciseBlueprint(
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
  private constructor(
    public name: string,
    private differentiator: string,
  ) {}

  static fromExerciseBlueprint(e: ExerciseBlueprint): KeyedExerciseBlueprint {
    return new KeyedExerciseBlueprint(
      e.name,
      match(e)
        .with(
          P.instanceOf(WeightedExerciseBlueprint),
          (ex) => `${ex.sets}_${ex.repsPerSet}`,
        )
        .with(
          P.instanceOf(CardioExerciseBlueprint),
          (t) => t.sets[0]?.target.type ?? 'distance',
        )
        .exhaustive(),
    );
  }

  toString() {
    return `${this.name}_${this.differentiator}`;
  }
}

export type NormalizedNameKey = string;

export class NormalizedName {
  constructor(public name: string) {}
  static fromExerciseBlueprint(e: ExerciseBlueprint): NormalizedName {
    return new NormalizedName(e.name);
  }

  toString(): NormalizedNameKey {
    return NormalizedName.normalizeName(this.name);
  }

  private static normalizeName(name?: string): string {
    if (!name) {
      return '';
    }
    const lowerName = name
      .toLowerCase()
      .trim()
      .replace(/flies/g, 'flys')
      .replace(/flyes/g, 'flys');
    const withoutPlural = lowerName.endsWith('es')
      ? lowerName.slice(0, -2)
      : lowerName.endsWith('s')
        ? lowerName.slice(0, -1)
        : lowerName;

    return withoutPlural;
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
export const EmptyExerciseBlueprint = new WeightedExerciseBlueprint(
  '',
  3,
  10,
  BigNumber(0),
  Rest.medium,
  false,
  '',
  '',
);

export function cardioTargetEquals(a: CardioTarget, b: CardioTarget): boolean {
  if (a.type !== b.type) return false;
  if (a.type === 'time' && b.type === 'time') {
    return a.value.equals(b.value);
  }
  if (a.type === 'distance' && b.type === 'distance') {
    return a.value.value.eq(b.value.value) && a.value.unit === b.value.unit;
  }
  return false;
}

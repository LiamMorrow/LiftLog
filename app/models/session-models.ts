import { LocalDateTimeComparer } from '@/models/comparers';
import { indexed } from '@/utils/enumerable';
import { uuid } from '@/utils/uuid';
import { Duration, LocalDate, LocalDateTime, ZoneOffset } from '@js-joda/core';
import BigNumber from 'bignumber.js';
import Enumerable from 'linq';
import { match, P } from 'ts-pattern';

export interface SessionPOJO {
  _BRAND: 'SESSION_POJO';
  id: string;
  blueprint: SessionBlueprintPOJO;
  recordedExercises: RecordedExercisePOJO[];
  date: LocalDate;
  bodyweight: BigNumber | undefined;
}

export type DeepOmit<T, K extends PropertyKey> = K extends keyof T
  ? T extends object
    ? T extends (infer U)[]
      ? DeepOmit<U, K>[]
      : {
          [P in keyof T as P extends K ? never : P]: DeepOmit<T[P], K>;
        }
    : T
  : T extends (infer U)[]
    ? DeepOmit<U, K>[]
    : T;

export class Session {
  readonly id: string;
  readonly blueprint: SessionBlueprint;
  readonly recordedExercises: RecordedExercise[];
  readonly date: LocalDate;
  readonly bodyweight: BigNumber | undefined;

  /**
   * @deprecated please use full constructor. Here only for serialization
   */
  constructor();
  constructor(
    id: string,
    blueprint: SessionBlueprint,
    recordedExercises: RecordedExercise[],
    date: LocalDate,
    bodyweight: BigNumber | undefined,
  );
  constructor(
    id?: string,
    blueprint?: SessionBlueprint,
    recordedExercises?: RecordedExercise[],
    date?: LocalDate,
    bodyweight?: BigNumber,
  ) {
    this.id = id!;
    this.blueprint = blueprint!;
    this.recordedExercises = recordedExercises!;
    this.date = date!;
    this.bodyweight = bodyweight!;
  }

  static fromPOJO(pojo: DeepOmit<SessionPOJO, '_BRAND'>): Session;
  static fromPOJO(pojo: undefined): undefined;
  static fromPOJO(
    pojo: DeepOmit<SessionPOJO, '_BRAND'> | undefined,
  ): Session | undefined;
  static fromPOJO(
    pojo: DeepOmit<SessionPOJO, '_BRAND'> | undefined,
  ): Session | undefined {
    return (
      pojo &&
      new Session(
        pojo.id,
        SessionBlueprint.fromPOJO(pojo.blueprint),
        pojo.recordedExercises.map(RecordedExercise.fromPOJO),
        pojo.date,
        pojo.bodyweight,
      )
    );
  }

  equals(other: Session | undefined): boolean {
    if (!other) {
      return false;
    }

    return (
      this.id === other.id &&
      this.date.equals(other.date) &&
      BigNumberEqual(this.bodyweight, other.bodyweight) &&
      this.blueprint.equals(other.blueprint) &&
      this.recordedExercises.length === other.recordedExercises.length &&
      this.recordedExercises.every((exercise, index) =>
        exercise.equals(other.recordedExercises[index]),
      )
    );
  }

  with(other: Partial<Session>) {
    return new Session(
      'id' in other ? other.id : this.id,
      'blueprint' in other ? other.blueprint : this.blueprint,
      'recordedExercises' in other
        ? other.recordedExercises
        : this.recordedExercises,
      'date' in other ? other.date : this.date,
      'bodyweight' in other ? other.bodyweight! : this.bodyweight,
    );
  }

  withNoSetsCompleted(): Session {
    return this.with({
      recordedExercises: this.recordedExercises.map((re) =>
        re.withNoSetsCompleted(),
      ),
    });
  }

  toPOJO(): SessionPOJO {
    return {
      _BRAND: 'SESSION_POJO',
      blueprint: this.blueprint.toPOJO(),
      bodyweight: this.bodyweight,
      date: this.date,
      id: this.id,
      recordedExercises: this.recordedExercises.map((x) => x.toPOJO()),
    };
  }

  static freeformSession(
    date: LocalDate,
    bodyweight: BigNumber | undefined,
  ): Session {
    return EmptySession.with({
      id: uuid(),
      date: date,
      bodyweight,
      blueprint: EmptySession.blueprint.with({ name: 'Freeform Workout' }),
    });
  }

  get totalWeightLifted(): BigNumber {
    return this.recordedExercises.reduce(
      (b, ex) =>
        b.plus(
          ex.potentialSets.reduce(
            (c, set) =>
              c.plus(set.weight.multipliedBy(set.set?.repsCompleted ?? 0)),
            new BigNumber(0),
          ),
        ),
      new BigNumber(0),
    );
  }

  get isComplete() {
    return this.recordedExercises.every((x) => !x.hasRemainingSets);
  }

  get isStarted(): boolean {
    return this.recordedExercises.some((x) => x.lastRecordedSet !== undefined);
  }

  get nextExercise(): RecordedExercise | undefined {
    const recordedExercises = this.recordedExercises;
    const latestExerciseIndex = Enumerable.from(recordedExercises)
      .select(indexed)
      .where((x) => !!x.item.lastRecordedSet)
      .orderByDescending(
        ({ item }) => item.lastRecordedSet!.set?.completionDateTime,
        LocalDateTimeComparer,
      )
      .select((x) => x.index)
      .firstOrDefault(-1);

    const latestExerciseSupersetsWithNext = match(latestExerciseIndex)
      .with(-1, () => false)
      .with(recordedExercises.length - 1, () => false) // can never superset with next if its the last exercise
      .otherwise((i) => recordedExercises[i].blueprint.supersetWithNext);

    const latestExerciseSupersetsWithPrevious = match(latestExerciseIndex)
      .with(P.union(-1, 0), () => false)
      .otherwise((i) => recordedExercises[i - 1].blueprint.supersetWithNext);

    if (
      latestExerciseSupersetsWithNext &&
      recordedExercises[latestExerciseIndex + 1]?.hasRemainingSets
    ) {
      return recordedExercises[latestExerciseIndex + 1];
    }

    // loop back to the original exercise in the case of a superset chain
    if (latestExerciseSupersetsWithPrevious) {
      let indexToJumpBackTo = latestExerciseIndex - 1;
      while (
        indexToJumpBackTo >= 0 &&
        recordedExercises[indexToJumpBackTo].blueprint.supersetWithNext
      ) {
        indexToJumpBackTo--;
      }
      // We are now at an exercise which is not supersetting with the next,
      // so jump forward to the next exercise
      indexToJumpBackTo++;
      // Now jump to the first exercise which has remaining sets in the chain
      while (
        indexToJumpBackTo < recordedExercises.length &&
        !recordedExercises[indexToJumpBackTo].hasRemainingSets
      ) {
        indexToJumpBackTo++;
      }

      if (indexToJumpBackTo < recordedExercises.length) {
        return recordedExercises[indexToJumpBackTo];
      }
    }

    let result: RecordedExercise | undefined = undefined;
    let maxEpochSecond = Number.MIN_VALUE;

    for (const recordedExercise of recordedExercises) {
      if (recordedExercise.hasRemainingSets) {
        const lastRecordedSet = recordedExercise.lastRecordedSet;
        const epochSecond =
          lastRecordedSet?.set?.completionDateTime.toEpochSecond(
            ZoneOffset.UTC,
          ) ?? Number.MIN_VALUE;

        if (epochSecond > maxEpochSecond || !result) {
          maxEpochSecond = epochSecond;
          result = recordedExercise;
        }
      }
    }
    return result;
  }

  get lastExercise(): RecordedExercise | undefined {
    return Enumerable.from(this.recordedExercises)
      .where((x) => x.potentialSets.some((set) => set.set))
      .defaultIfEmpty(undefined)
      .maxBy((x) =>
        x.lastRecordedSet?.set?.completionDateTime
          .toInstant(ZoneOffset.UTC)
          .toEpochMilli(),
      );
  }

  get isFreeform(): boolean {
    return this.blueprint.name === 'Freeform Workout';
  }
}

export interface RecordedExercisePOJO {
  _BRAND: 'RECORDED_EXERCISE_POJO';
  blueprint: ExerciseBlueprintPOJO;
  potentialSets: PotentialSetPOJO[];
  notes: string | undefined;
  perSetWeight: boolean;
}

export class RecordedExercise {
  readonly blueprint: ExerciseBlueprint;
  readonly potentialSets: readonly PotentialSet[];
  readonly notes: string | undefined;
  readonly perSetWeight: boolean;

  /**
   * @deprecated please use full constructor. Here only for serialization
   */
  constructor();
  constructor(
    blueprint: ExerciseBlueprint,
    potentialSets: readonly PotentialSet[],
    notes: string | undefined,
    perSetWeight: boolean,
  );
  constructor(
    blueprint?: ExerciseBlueprint,
    potentialSets?: readonly PotentialSet[],
    notes?: string,
    perSetWeight?: boolean,
  ) {
    this.blueprint = blueprint!;
    this.potentialSets = potentialSets!;
    this.notes = notes!;
    this.perSetWeight = perSetWeight!;
  }

  static fromPOJO(
    fromPOJO: DeepOmit<RecordedExercisePOJO, '_BRAND'>,
  ): RecordedExercise {
    return new RecordedExercise(
      ExerciseBlueprint.fromPOJO(fromPOJO.blueprint),
      fromPOJO.potentialSets.map((x) => PotentialSet.fromPOJO(x)),
      fromPOJO.notes,
      fromPOJO.perSetWeight,
    );
  }

  equals(other: RecordedExercise | undefined) {
    if (!other) {
      return false;
    }
    if (other === this) {
      return true;
    }

    return (
      this.blueprint.equals(other.blueprint) &&
      this.perSetWeight === other.perSetWeight &&
      this.notes === other.notes &&
      this.potentialSets.length === other.potentialSets.length &&
      this.potentialSets.every((set, index) => {
        const otherSet = other.potentialSets[index];
        return otherSet.equals(set);
      })
    );
  }

  with(other: Partial<RecordedExercisePOJO>) {
    return new RecordedExercise(
      'blueprint' in other
        ? ExerciseBlueprint.fromPOJO(other.blueprint)
        : this.blueprint,
      'potentialSets' in other
        ? other.potentialSets.map((x) => PotentialSet.fromPOJO(x))
        : this.potentialSets,
      'notes' in other ? other.notes : this.notes,
      'perSetWeight' in other ? other.perSetWeight : this.perSetWeight,
    );
  }

  withNoSetsCompleted(): RecordedExercise {
    return this.with({
      notes: undefined,
      potentialSets: this.potentialSets.map((ps) =>
        ps.with({ set: undefined }).toPOJO(),
      ),
    });
  }

  toPOJO(): RecordedExercisePOJO {
    return {
      _BRAND: 'RECORDED_EXERCISE_POJO',
      blueprint: this.blueprint.toPOJO(),
      perSetWeight: this.perSetWeight,
      potentialSets: this.potentialSets.map((x) => x.toPOJO()),
      notes: this.notes,
    };
  }

  get maxWeight(): BigNumber {
    return (
      this.potentialSets.reduce(
        (max, set) => {
          return !max || set.weight.isGreaterThan(max) ? set.weight : max;
        },
        undefined as BigNumber | undefined,
      ) ?? BigNumber(0)
    );
  }

  get lastRecordedSet(): PotentialSet | undefined {
    const result = Enumerable.from(this.potentialSets)
      .orderByDescending(
        (x) => x.set?.completionDateTime,
        LocalDateTimeComparer,
      )
      .firstOrDefault((x) => x.set !== undefined);
    return result;
  }

  get hasRemainingSets(): boolean {
    return this.potentialSets.some((x) => x.set === undefined);
  }

  /// <summary>
  /// An exercise is considered a success if ALL sets are successful, with ANY of the sets >= the top level weight
  /// </summary>
  get isSuccessForProgressiveOverload(): boolean {
    return this.potentialSets.every(
      (x) => x.set && x.set.repsCompleted >= this.blueprint.repsPerSet,
    );
  }
}

export interface RecordedSetPOJO {
  _BRAND: 'RECORDED_SET_POJO';
  repsCompleted: number;
  completionDateTime: LocalDateTime;
}

export class RecordedSet {
  readonly repsCompleted: number;
  readonly completionDateTime: LocalDateTime;

  /**
   * @deprecated please use full constructor. Here only for serialization
   */
  constructor();
  constructor(repsCompleted: number, completionDateTime: LocalDateTime);
  constructor(repsCompleted?: number, completionDateTime?: LocalDateTime) {
    this.repsCompleted = repsCompleted!;
    this.completionDateTime = completionDateTime!;
  }

  static fromPOJO(pojo: DeepOmit<RecordedSetPOJO, '_BRAND'>): RecordedSet {
    return new RecordedSet(pojo.repsCompleted, pojo.completionDateTime);
  }

  equals(other: RecordedSet | undefined): boolean {
    if (!other) {
      return false;
    }
    if (other === this) {
      return true;
    }
    return (
      this.repsCompleted === other.repsCompleted &&
      this.completionDateTime.equals(other.completionDateTime)
    );
  }

  with(other: Partial<RecordedSet>): RecordedSet {
    return new RecordedSet(
      'repsCompleted' in other ? other.repsCompleted : this.repsCompleted,
      'completionDateTime' in other
        ? other.completionDateTime
        : this.completionDateTime,
    );
  }

  toPOJO(): RecordedSetPOJO {
    return {
      _BRAND: 'RECORDED_SET_POJO',
      repsCompleted: this.repsCompleted,
      completionDateTime: this.completionDateTime,
    };
  }
}

export interface PotentialSetPOJO {
  _BRAND: 'POTENTIAL_SET_POJO';
  set: RecordedSetPOJO | undefined;
  weight: BigNumber;
}

export class PotentialSet {
  readonly set: RecordedSet | undefined;
  readonly weight: BigNumber;

  /**
   * @deprecated please use full constructor. Here only for serialization
   */
  constructor();
  constructor(set: RecordedSet | undefined, weight: BigNumber);
  constructor(set?: RecordedSet, weight?: BigNumber) {
    this.set = set;
    this.weight = weight!;
  }

  static fromPOJO(pojo: DeepOmit<PotentialSetPOJO, '_BRAND'>): PotentialSet {
    return new PotentialSet(
      pojo.set ? RecordedSet.fromPOJO(pojo.set) : undefined,
      pojo.weight,
    );
  }

  equals(other: PotentialSet | undefined): boolean {
    if (!other) {
      return false;
    }
    if (other === this) {
      return true;
    }
    return (
      (this.set?.equals(other.set) ?? other.set === undefined) &&
      this.weight.isEqualTo(other.weight)
    );
  }

  with(other: Partial<PotentialSet>): PotentialSet {
    return new PotentialSet(
      'set' in other ? other.set : this.set,
      'weight' in other ? other.weight : this.weight,
    );
  }

  toPOJO(): PotentialSetPOJO {
    return {
      _BRAND: 'POTENTIAL_SET_POJO',
      set: this.set?.toPOJO(),
      weight: this.weight,
    };
  }
}

function BigNumberEqual(a: BigNumber | undefined, b: BigNumber | undefined) {
  if (a === undefined || b === undefined) {
    return a === b;
  }
  return a.isEqualTo(b);
}

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
    pojo: DeepOmit<ProgramBlueprintPOJO, '_BRAND'>,
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
    pojo: DeepOmit<SessionBlueprintPOJO, '_BRAND'>,
  ): SessionBlueprint {
    return new SessionBlueprint(
      pojo.name,
      pojo.exercises.map(ExerciseBlueprint.fromPOJO),
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

  getEmptySession(): Session {
    function getNextExercise(e: ExerciseBlueprint) {
      return new RecordedExercise(
        e,
        Array.from({ length: e.sets }).map(
          () => new PotentialSet(undefined, BigNumber(0)),
        ),
        undefined,
        false,
      );
    }
    return new Session(
      uuid(),
      this,
      this.exercises.map(getNextExercise),
      LocalDate.now(),
      undefined,
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
    pojo: DeepOmit<ExerciseBlueprintPOJO, '_BRAND'>,
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

  equals(other: ExerciseBlueprint | ExerciseBlueprintPOJO | undefined) {
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

export const EmptySession: Session = new Session(
  '00000000-0000-0000-0000-000000000000',
  SessionBlueprint.fromPOJO({
    name: '',
    exercises: [],
    notes: '',
  }),
  [],
  LocalDate.MIN,
  undefined,
);

export const EmptyExerciseBlueprint = new ExerciseBlueprint(
  '',
  3,
  10,
  BigNumber(0),
  Rest.medium,
  false,
  '',
  '',
);

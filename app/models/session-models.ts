import {
  WeightedExerciseBlueprint,
  WeightedExerciseBlueprintPOJO,
  SessionBlueprint,
  SessionBlueprintPOJO,
  CardioExerciseBlueprintPOJO,
  CardioExerciseBlueprint,
} from '@/models/blueprint-models';
import { LocalDateTimeComparer } from '@/models/comparers';
import { DeepOmit } from '@/utils/deep-omit';
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
  recordedExercises: RecordedWeightedExercisePOJO[];
  date: LocalDate;
  bodyweight: BigNumber | undefined;
}

export class Session {
  readonly id: string;
  readonly blueprint: SessionBlueprint;
  readonly recordedExercises: RecordedWeightedExercise[];
  readonly date: LocalDate;
  readonly bodyweight: BigNumber | undefined;

  /**
   * @deprecated please use full constructor. Here only for serialization
   */
  constructor();
  constructor(
    id: string,
    blueprint: SessionBlueprint,
    recordedExercises: RecordedWeightedExercise[],
    date: LocalDate,
    bodyweight: BigNumber | undefined,
  );
  constructor(
    id?: string,
    blueprint?: SessionBlueprint,
    recordedExercises?: RecordedWeightedExercise[],
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
        pojo.recordedExercises.map(RecordedWeightedExercise.fromPOJO),
        pojo.date,
        pojo.bodyweight,
      )
    );
  }

  static getEmptySession(blueprint: SessionBlueprint): Session {
    function getNextExercise(e: WeightedExerciseBlueprint) {
      return new RecordedWeightedExercise(
        e,
        Array.from({ length: e.sets }).map(
          () => new PotentialSet(undefined, BigNumber(0)),
        ),
        undefined,
      );
    }
    return new Session(
      uuid(),
      blueprint,
      blueprint.exercises.map(getNextExercise),
      LocalDate.now(),
      undefined,
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

  get nextExercise(): RecordedWeightedExercise | undefined {
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

    let result: RecordedWeightedExercise | undefined = undefined;
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

  get lastExercise(): RecordedWeightedExercise | undefined {
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

export interface RecordedCardioExercisePOJO {
  _BRAND: 'RECORDED_CARDIO_EXERCISE_POJO';
  blueprint: CardioExerciseBlueprintPOJO;
  completionDateTime: LocalDateTime | undefined;
  actualTime: Duration | undefined;
  actualDistance: BigNumber | undefined;
  resistance: BigNumber | undefined;
  incline: BigNumber | undefined;
  avgHeartRate: number | undefined;
  notes: string | undefined;
}
export class RecordedCardioExercise {
  readonly blueprint: CardioExerciseBlueprint;
  readonly completionDateTime: LocalDateTime | undefined;
  readonly actualTime: Duration | undefined;
  readonly actualDistance: BigNumber | undefined;
  readonly resistance: BigNumber | undefined;
  readonly incline: BigNumber | undefined;
  readonly avgHeartRate: number | undefined;
  readonly notes: string | undefined;

  /**
   * @deprecated please use full constructor. Here only for serialization
   */
  constructor();
  constructor(
    blueprint: CardioExerciseBlueprint,
    completionDateTime: LocalDateTime | undefined,
    actualTime: Duration | undefined,
    actualDistance: BigNumber | undefined,
    resistance: BigNumber | undefined,
    incline: BigNumber | undefined,
    avgHeartRate: number | undefined,
    notes: string | undefined,
  );
  constructor(
    blueprint?: CardioExerciseBlueprint,
    completionDateTime?: LocalDateTime,
    actualTime?: Duration,
    actualDistance?: BigNumber,
    resistance?: BigNumber,
    incline?: BigNumber,
    avgHeartRate?: number,
    notes?: string,
  ) {
    this.blueprint = blueprint!;
    this.completionDateTime = completionDateTime;
    this.actualTime = actualTime;
    this.actualDistance = actualDistance;
    this.resistance = resistance;
    this.incline = incline;
    this.avgHeartRate = avgHeartRate;
    this.notes = notes;
  }

  static fromPOJO(
    pojo: DeepOmit<RecordedCardioExercisePOJO, '_BRAND'>,
  ): RecordedCardioExercise {
    return new RecordedCardioExercise(
      CardioExerciseBlueprint.fromPOJO(pojo.blueprint),
      pojo.completionDateTime,
      pojo.actualTime,
      pojo.actualDistance,
      pojo.resistance,
      pojo.incline,
      pojo.avgHeartRate,
      pojo.notes,
    );
  }

  equals(other: RecordedCardioExercise | undefined): boolean {
    if (!other) {
      return false;
    }
    if (other === this) {
      return true;
    }
    return (
      this.blueprint === other.blueprint &&
      ((this.completionDateTime &&
        other.completionDateTime &&
        this.completionDateTime.equals(other.completionDateTime)) ||
        this.completionDateTime === other.completionDateTime) &&
      ((this.actualTime &&
        other.actualTime &&
        this.actualTime.equals(other.actualTime)) ||
        this.actualTime === other.actualTime) &&
      ((this.actualDistance &&
        other.actualDistance &&
        this.actualDistance.isEqualTo(other.actualDistance)) ||
        this.actualDistance === other.actualDistance) &&
      ((this.resistance &&
        other.resistance &&
        this.resistance.isEqualTo(other.resistance)) ||
        this.resistance === other.resistance) &&
      ((this.incline &&
        other.incline &&
        this.incline.isEqualTo(other.incline)) ||
        this.incline === other.incline) &&
      this.avgHeartRate === other.avgHeartRate &&
      this.notes === other.notes
    );
  }

  with(
    other: DeepOmit<RecordedCardioExercisePOJO, 'BRAND'>,
  ): RecordedCardioExercise {
    return new RecordedCardioExercise(
      CardioExerciseBlueprint.fromPOJO(other.blueprint ?? this.blueprint),
      other.completionDateTime ?? this.completionDateTime,
      other.actualTime ?? this.actualTime,
      other.actualDistance ?? this.actualDistance,
      other.resistance ?? this.resistance,
      other.incline ?? this.incline,
      other.avgHeartRate ?? this.avgHeartRate,
      other.notes ?? this.notes,
    );
  }

  toPOJO(): RecordedCardioExercisePOJO {
    return {
      _BRAND: 'RECORDED_CARDIO_EXERCISE_POJO',
      blueprint: this.blueprint.toPOJO(),
      completionDateTime: this.completionDateTime,
      actualTime: this.actualTime,
      actualDistance: this.actualDistance,
      resistance: this.resistance,
      incline: this.incline,
      avgHeartRate: this.avgHeartRate,
      notes: this.notes,
    };
  }
}

export interface RecordedWeightedExercisePOJO {
  _BRAND: 'RECORDED_WEIGHTED_EXERCISE_POJO';
  blueprint: WeightedExerciseBlueprintPOJO;
  potentialSets: PotentialSetPOJO[];
  notes: string | undefined;
}

export class RecordedWeightedExercise {
  readonly blueprint: WeightedExerciseBlueprint;
  readonly potentialSets: readonly PotentialSet[];
  readonly notes: string | undefined;

  /**
   * @deprecated please use full constructor. Here only for serialization
   */
  constructor();
  constructor(
    blueprint: WeightedExerciseBlueprint,
    potentialSets: readonly PotentialSet[],
    notes: string | undefined,
  );
  constructor(
    blueprint?: WeightedExerciseBlueprint,
    potentialSets?: readonly PotentialSet[],
    notes?: string,
  ) {
    this.blueprint = blueprint!;
    this.potentialSets = potentialSets!;
    this.notes = notes!;
  }

  static fromPOJO(
    fromPOJO: DeepOmit<RecordedWeightedExercisePOJO, '_BRAND'>,
  ): RecordedWeightedExercise {
    return new RecordedWeightedExercise(
      WeightedExerciseBlueprint.fromPOJO(fromPOJO.blueprint),
      fromPOJO.potentialSets.map((x) => PotentialSet.fromPOJO(x)),
      fromPOJO.notes,
    );
  }

  equals(other: RecordedWeightedExercise | undefined) {
    if (!other) {
      return false;
    }
    if (other === this) {
      return true;
    }

    return (
      this.blueprint.equals(other.blueprint) &&
      this.notes === other.notes &&
      this.potentialSets.length === other.potentialSets.length &&
      this.potentialSets.every((set, index) => {
        const otherSet = other.potentialSets[index];
        return otherSet.equals(set);
      })
    );
  }

  with(other: Partial<RecordedWeightedExercisePOJO>) {
    return new RecordedWeightedExercise(
      'blueprint' in other
        ? WeightedExerciseBlueprint.fromPOJO(other.blueprint)
        : this.blueprint,
      'potentialSets' in other
        ? other.potentialSets.map((x) => PotentialSet.fromPOJO(x))
        : this.potentialSets,
      'notes' in other ? other.notes : this.notes,
    );
  }

  withNoSetsCompleted(): RecordedWeightedExercise {
    return this.with({
      notes: undefined,
      potentialSets: this.potentialSets.map((ps) =>
        ps.with({ set: undefined }).toPOJO(),
      ),
    });
  }

  toPOJO(): RecordedWeightedExercisePOJO {
    return {
      _BRAND: 'RECORDED_WEIGHTED_EXERCISE_POJO',
      blueprint: this.blueprint.toPOJO(),
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

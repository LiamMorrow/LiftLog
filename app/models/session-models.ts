import {
  WeightedExerciseBlueprint,
  WeightedExerciseBlueprintPOJO,
  SessionBlueprint,
  SessionBlueprintPOJO,
  CardioExerciseBlueprintPOJO,
  CardioExerciseBlueprint,
  ExerciseBlueprint,
  Distance,
} from '@/models/blueprint-models';
import { LocalDateTimeComparer } from '@/models/comparers';
import { Weight, WeightUnit } from '@/models/weight';
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
  recordedExercises: RecordedExercisePOJO[];
  date: LocalDate;
  bodyweight: Weight | undefined;
}

export class Session {
  readonly id: string;
  readonly blueprint: SessionBlueprint;
  readonly recordedExercises: RecordedExercise[];
  readonly date: LocalDate;
  readonly bodyweight: Weight | undefined;

  constructor(
    id: string,
    blueprint: SessionBlueprint,
    recordedExercises: RecordedExercise[],
    date: LocalDate,
    bodyweight: Weight | undefined,
  ) {
    this.id = id!;
    this.blueprint = blueprint!;
    this.recordedExercises = recordedExercises!;
    this.date = date!;
    this.bodyweight = bodyweight!;
  }
  get duration(): Duration | undefined {
    return this.lastExercise?.latestTime && this.firstExercise?.earliestTime
      ? Duration.between(
          this.firstExercise.earliestTime,
          this.lastExercise.latestTime,
        )
      : undefined;
  }

  static fromPOJO(pojo: Omit<SessionPOJO, '_BRAND'>): Session;
  static fromPOJO(pojo: undefined): undefined;
  static fromPOJO(
    pojo: Omit<SessionPOJO, '_BRAND'> | undefined,
  ): Session | undefined;
  static fromPOJO(
    pojo: Omit<SessionPOJO, '_BRAND'> | undefined,
  ): Session | undefined {
    return (
      pojo &&
      new Session(
        pojo.id,
        SessionBlueprint.fromPOJO(pojo.blueprint),
        pojo.recordedExercises.map(fromRecordedExercisePOJO),
        pojo.date,
        pojo.bodyweight,
      )
    );
  }

  static getEmptySession(
    blueprint: SessionBlueprint,
    defaultWeightUnit: WeightUnit,
  ): Session {
    function getNextExercise(e: ExerciseBlueprint) {
      return match(e)
        .with(
          P.instanceOf(WeightedExerciseBlueprint),
          (we) =>
            new RecordedWeightedExercise(
              we,
              Array.from({ length: we.sets }).map(
                () =>
                  new PotentialSet(undefined, new Weight(0, defaultWeightUnit)),
              ),
              undefined,
            ),
        )
        .with(
          P.instanceOf(CardioExerciseBlueprint),
          (ce) =>
            new RecordedCardioExercise(
              ce,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
            ),
        )
        .exhaustive();
    }
    return new Session(
      uuid(),
      blueprint,
      blueprint.exercises.map(getNextExercise),
      LocalDate.now(),
      undefined,
    );
  }

  withNoNilWeights(fallbackWeightUnit: WeightUnit): Session | undefined {
    return this.with({
      recordedExercises: this.recordedExercises.map((re) =>
        re instanceof RecordedWeightedExercise
          ? re.with({
              potentialSets: re.potentialSets.map((ps) =>
                ps
                  .with({
                    weight: ps.weight.with({
                      unit:
                        ps.weight.unit === 'nil'
                          ? fallbackWeightUnit
                          : ps.weight.unit,
                    }),
                  })
                  .toPOJO(),
              ),
            })
          : re,
      ),
    });
  }

  equals(other: Session | undefined): boolean {
    if (!other) {
      return false;
    }

    return (
      this.id === other.id &&
      this.date.equals(other.date) &&
      WeightEqual(this.bodyweight, other.bodyweight) &&
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

  withNothingCompleted(): Session {
    return this.with({
      recordedExercises: this.recordedExercises.map((re) =>
        re.withNothingCompleted(),
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
    bodyweight: Weight | undefined,
  ): Session {
    return EmptySession.with({
      id: uuid(),
      date: date,
      bodyweight,
      blueprint: EmptySession.blueprint.with({ name: 'Freeform Workout' }),
    });
  }

  get totalWeightLifted(): Weight {
    return this.recordedExercises.reduce(
      (b, ex) =>
        b.plus(
          ex instanceof RecordedWeightedExercise
            ? ex.potentialSets.reduce(
                (c, set) =>
                  c.plus(set.weight.multipliedBy(set.set?.repsCompleted ?? 0)),
                Weight.NIL,
              )
            : Weight.NIL,
        ),
      Weight.NIL,
    );
  }

  get isComplete() {
    return this.recordedExercises.every((x) => x.isComplete);
  }

  get isStarted(): boolean {
    return this.recordedExercises.some((x) => x.isStarted);
  }

  get nextExercise(): RecordedExercise | undefined {
    const recordedExercises = this.recordedExercises;
    const latestExerciseIndex = Enumerable.from(recordedExercises)
      .select(indexed)
      .where((x) => x.item.isStarted)
      .orderByDescending(({ item }) => item.latestTime, LocalDateTimeComparer)
      .select((x) => x.index)
      .firstOrDefault(-1);

    const latestExerciseSupersetsWithNext = match(latestExerciseIndex)
      .with(-1, () => false)
      .with(recordedExercises.length - 1, () => false) // can never superset with next if its the last exercise
      .otherwise(
        (i) =>
          recordedExercises[i] instanceof RecordedWeightedExercise &&
          recordedExercises[i].blueprint.supersetWithNext,
      );

    const latestExerciseSupersetsWithPrevious = match(latestExerciseIndex)
      .with(P.union(-1, 0), () => false)
      .otherwise((i) => {
        const prevIndex = i - 1;
        return (
          recordedExercises[prevIndex] instanceof RecordedWeightedExercise &&
          recordedExercises[prevIndex].blueprint.supersetWithNext
        );
      });

    if (
      latestExerciseSupersetsWithNext &&
      !recordedExercises[latestExerciseIndex + 1]?.isComplete
    ) {
      return recordedExercises[latestExerciseIndex + 1];
    }

    // loop back to the original exercise in the case of a superset chain
    if (latestExerciseSupersetsWithPrevious) {
      let indexToJumpBackTo = latestExerciseIndex - 1;
      while (
        indexToJumpBackTo >= 0 &&
        recordedExercises[indexToJumpBackTo] instanceof
          RecordedWeightedExercise &&
        (
          recordedExercises[indexToJumpBackTo]
            .blueprint as WeightedExerciseBlueprint
        ).supersetWithNext
      ) {
        indexToJumpBackTo--;
      }
      // We are now at an exercise which is not supersetting with the next,
      // so jump forward to the next exercise
      indexToJumpBackTo++;
      // Now jump to the first exercise which has remaining sets in the chain
      while (
        indexToJumpBackTo < recordedExercises.length &&
        recordedExercises[indexToJumpBackTo].isComplete
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
      if (!recordedExercise.isComplete) {
        const latestTime = recordedExercise.latestTime;
        const epochSecond =
          latestTime?.toEpochSecond(ZoneOffset.UTC) ?? Number.MIN_VALUE;

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
      .where((x) => x.isStarted)
      .defaultIfEmpty(undefined)
      .maxBy((x) => x.latestTime?.toInstant(ZoneOffset.UTC).toEpochMilli());
  }

  get latestWeightedExercise(): RecordedWeightedExercise | undefined {
    return Enumerable.from(this.recordedExercises)
      .where((x) => x.isStarted)
      .where((x) => x instanceof RecordedWeightedExercise)
      .defaultIfEmpty(undefined)
      .maxBy((x) => x.latestTime?.toInstant(ZoneOffset.UTC).toEpochMilli());
  }

  get firstExercise(): RecordedExercise | undefined {
    return Enumerable.from(this.recordedExercises)
      .where((x) => x.isStarted)
      .defaultIfEmpty(undefined)
      .minBy((x) => x.latestTime?.toInstant(ZoneOffset.UTC).toEpochMilli());
  }

  get isFreeform(): boolean {
    return this.blueprint.name === 'Freeform Workout';
  }
}

export type RecordedExercise =
  | RecordedCardioExercise
  | RecordedWeightedExercise;

export type RecordedExercisePOJO =
  | RecordedCardioExercisePOJO
  | RecordedWeightedExercisePOJO;

export function fromRecordedExercisePOJO(
  pojo: RecordedExercisePOJO | RecordedExercise,
): RecordedExercise {
  return match(pojo)
    .with(
      P.union(
        { _BRAND: 'RECORDED_CARDIO_EXERCISE_POJO' },
        P.instanceOf(RecordedCardioExercise),
      ),
      RecordedCardioExercise.fromPOJO,
    )
    .with(
      P.union(
        { _BRAND: 'RECORDED_WEIGHTED_EXERCISE_POJO' },
        P.instanceOf(RecordedWeightedExercise),
      ),
      RecordedWeightedExercise.fromPOJO,
    )
    .exhaustive();
}

export function createEmptyRecordedExercise(
  blueprint: ExerciseBlueprint,
  unit: WeightUnit,
) {
  return match(blueprint)
    .with(P.instanceOf(WeightedExerciseBlueprint), (b) =>
      RecordedWeightedExercise.empty(b, unit),
    )
    .with(P.instanceOf(CardioExerciseBlueprint), (b) =>
      RecordedCardioExercise.empty(b),
    )
    .exhaustive();
}

export interface RecordedCardioExercisePOJO {
  _BRAND: 'RECORDED_CARDIO_EXERCISE_POJO';
  blueprint: CardioExerciseBlueprintPOJO;
  completionDateTime: LocalDateTime | undefined;
  duration: Duration | undefined;
  distance: Distance | undefined;
  resistance: BigNumber | undefined;
  incline: BigNumber | undefined;
  notes: string | undefined;
}
export class RecordedCardioExercise {
  readonly blueprint: CardioExerciseBlueprint;
  readonly completionDateTime: LocalDateTime | undefined;
  readonly duration: Duration | undefined;
  readonly distance: Distance | undefined;
  readonly resistance: BigNumber | undefined;
  readonly incline: BigNumber | undefined;
  readonly notes: string | undefined;

  /**
   * @deprecated please use full constructor. Here only for serialization
   */
  constructor();
  constructor(
    blueprint: CardioExerciseBlueprint,
    completionDateTime: LocalDateTime | undefined,
    duration: Duration | undefined,
    distance: Distance | undefined,
    resistance: BigNumber | undefined,
    incline: BigNumber | undefined,
    notes: string | undefined,
  );
  constructor(
    blueprint?: CardioExerciseBlueprint,
    completionDateTime?: LocalDateTime,
    duration?: Duration,
    distance?: Distance,
    resistance?: BigNumber,
    incline?: BigNumber,
    notes?: string,
  ) {
    this.blueprint = blueprint!;
    this.completionDateTime = completionDateTime;
    this.duration = duration;
    this.distance = distance;
    this.resistance = resistance;
    this.incline = incline;
    this.notes = notes;
  }

  static fromPOJO(
    pojo: DeepOmit<RecordedCardioExercisePOJO, '_BRAND'>,
  ): RecordedCardioExercise {
    return new RecordedCardioExercise(
      CardioExerciseBlueprint.fromPOJO(pojo.blueprint),
      pojo.completionDateTime,
      pojo.duration,
      pojo.distance,
      pojo.resistance,
      pojo.incline,
      pojo.notes,
    );
  }

  static empty(blueprint: CardioExerciseBlueprint): RecordedCardioExercise {
    return new RecordedCardioExercise(
      blueprint,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    );
  }

  get isComplete(): boolean {
    return !!this.completionDateTime;
  }

  get isStarted() {
    return !!this.completionDateTime;
  }

  get latestTime(): LocalDateTime | undefined {
    return this.completionDateTime;
  }

  get earliestTime(): LocalDateTime | undefined {
    return this.completionDateTime;
  }

  withNothingCompleted(): RecordedCardioExercise {
    return this.with({
      notes: undefined,
      distance: undefined,
      duration: undefined,
      completionDateTime: undefined,
      incline: undefined,
      resistance: undefined,
    });
  }

  equals(other: RecordedExercise | undefined): boolean {
    if (!other) {
      return false;
    }
    if (other === this) {
      return true;
    }
    if (other instanceof RecordedWeightedExercise) {
      return false;
    }
    return (
      this.blueprint.equals(other.blueprint) &&
      ((this.completionDateTime &&
        other.completionDateTime &&
        this.completionDateTime.equals(other.completionDateTime)) ||
        this.completionDateTime === other.completionDateTime) &&
      ((this.duration &&
        other.duration &&
        this.duration.equals(other.duration)) ||
        this.duration === other.duration) &&
      distanceEqual(this.distance, other.distance) &&
      ((this.resistance &&
        other.resistance &&
        this.resistance.isEqualTo(other.resistance)) ||
        this.resistance === other.resistance) &&
      ((this.incline &&
        other.incline &&
        this.incline.isEqualTo(other.incline)) ||
        this.incline === other.incline) &&
      this.notes === other.notes
    );
  }

  with(
    other: Partial<Omit<RecordedCardioExercisePOJO, '_BRAND'>>,
  ): RecordedCardioExercise {
    return new RecordedCardioExercise(
      CardioExerciseBlueprint.fromPOJO(other.blueprint ?? this.blueprint),
      other.completionDateTime ?? this.completionDateTime,
      other.duration ?? this.duration,
      other.distance ?? this.distance,
      other.resistance ?? this.resistance,
      other.incline ?? this.incline,
      other.notes ?? this.notes,
    );
  }

  toPOJO(): RecordedCardioExercisePOJO {
    return {
      _BRAND: 'RECORDED_CARDIO_EXERCISE_POJO',
      blueprint: this.blueprint.toPOJO(),
      completionDateTime: this.completionDateTime,
      duration: this.duration,
      distance: this.distance,
      resistance: this.resistance,
      incline: this.incline,
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
    fromPOJO:
      | Omit<RecordedWeightedExercisePOJO, '_BRAND'>
      | RecordedWeightedExercise,
  ): RecordedWeightedExercise {
    return new RecordedWeightedExercise(
      WeightedExerciseBlueprint.fromPOJO(fromPOJO.blueprint),
      fromPOJO.potentialSets.map((x) => PotentialSet.fromPOJO(x)),
      fromPOJO.notes,
    );
  }
  static empty(
    b: WeightedExerciseBlueprint,
    unit: WeightUnit,
  ): RecordedWeightedExercise {
    return new RecordedWeightedExercise(
      b,
      Enumerable.range(0, b.sets)
        .select(() =>
          PotentialSet.fromPOJO({
            weight: new Weight(0, unit),
            set: undefined,
          }),
        )
        .toArray(),
      undefined,
    );
  }

  equals(other: RecordedExercise | undefined) {
    if (!other) {
      return false;
    }
    if (other === this) {
      return true;
    }
    if (other instanceof RecordedCardioExercise) {
      return false;
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

  withNothingCompleted(): RecordedWeightedExercise {
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

  get maxWeight(): Weight {
    return (
      this.potentialSets.reduce(
        (max, set) => {
          return !max || set.weight.isGreaterThan(max) ? set.weight : max;
        },
        undefined as Weight | undefined,
      ) ?? new Weight(0, 'kilograms')
    );
  }

  get isStarted() {
    return !!this.firstRecordedSet;
  }

  get duration(): Duration | undefined {
    return this.latestTime && this.earliestTime
      ? Duration.between(this.earliestTime, this.latestTime)
      : undefined;
  }

  get latestTime(): LocalDateTime | undefined {
    return this.lastRecordedSet?.set?.completionDateTime;
  }

  get earliestTime(): LocalDateTime | undefined {
    return this.firstRecordedSet?.set?.completionDateTime;
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

  get firstRecordedSet(): PotentialSet | undefined {
    const result = Enumerable.from(this.potentialSets)
      .orderBy((x) => x.set?.completionDateTime, LocalDateTimeComparer)
      .firstOrDefault((x) => x.set !== undefined);
    return result;
  }

  get isComplete(): boolean {
    return !this.potentialSets.some((x) => x.set === undefined);
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
  weight: Weight;
}

export class PotentialSet {
  readonly set: RecordedSet | undefined;
  readonly weight: Weight;

  constructor(set: RecordedSet | undefined, weight: Weight) {
    this.set = set;
    this.weight = weight;
  }

  static fromPOJO(
    pojo: DeepOmit<PotentialSetPOJO, '_BRAND'> | PotentialSet,
  ): PotentialSet {
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
      this.weight.equals(other.weight)
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

function WeightEqual(a: Weight | undefined, b: Weight | undefined) {
  if (a === undefined || b === undefined) {
    return a === b;
  }
  return a.equals(b);
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

function distanceEqual(a: Distance | undefined, b: Distance | undefined) {
  return match([a, b])
    .with([undefined, undefined], () => true)
    .with(
      [P.nonNullable, P.nonNullable],
      ([a, b]) => a.unit === b.unit && b.value.isEqualTo(b.value),
    )
    .otherwise(() => false);
}

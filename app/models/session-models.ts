import { LiftLog } from '@/gen/proto';
import {
  WeightedExerciseBlueprint,
  WeightedExerciseBlueprintPOJO,
  SessionBlueprint,
  SessionBlueprintPOJO,
  CardioExerciseBlueprintPOJO,
  CardioExerciseBlueprint,
  ExerciseBlueprint,
  Distance,
  CardioExerciseSetBlueprint,
  CardioExerciseSetBlueprintPOJO,
  fromDistanceJSON,
  toDistanceJSON,
} from '@/models/blueprint-models';
import { TemporalComparer } from '@/models/comparers';
import { toWeightUnitDao, Weight, WeightUnit } from '@/models/weight';
import { DeepOmit } from '@/utils/deep-omit';
import { indexed } from '@/utils/enumerable';
import { uuid } from '@/utils/uuid';
import { Duration, LocalDate, OffsetDateTime } from '@js-joda/core';
import BigNumber from 'bignumber.js';
import Enumerable from 'linq';
import { match, P } from 'ts-pattern';
import {
  toDateOnlyDao,
  toDateTimeDao,
  toDecimalDao,
  toDurationDao,
  toStringValue,
  toTimeOnlyDao,
  toUuidDao,
} from './storage/conversions.to-dao';
import {
  fromBigNumberJSON,
  fromDurationJSON,
  fromLocalDateJSON,
  fromOffsetDateTimeJSON,
  PotentialSetJSON,
  RecordedCardioExerciseJSON,
  RecordedCardioExerciseSetJSON,
  RecordedExerciseJSON,
  RecordedSetJSON,
  RecordedWeightedExerciseJSON,
  SessionJSON,
  toBigNumberJSON,
  toDurationJSON,
  toLocalDateJSON,
  toOffsetDateTimeJSON,
} from './storage/versions/latest';

export interface SessionPOJO {
  type: 'Session';
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

  static fromPOJO(pojo: Omit<SessionPOJO, 'type'>): Session;
  static fromPOJO(pojo: undefined): undefined;
  static fromPOJO(
    pojo: Omit<SessionPOJO, 'type'> | undefined,
  ): Session | undefined;
  static fromPOJO(
    pojo: Omit<SessionPOJO, 'type'> | undefined,
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

  static fromJSON(json: SessionJSON): Session {
    return new Session(
      json.id,
      SessionBlueprint.fromJSON(json.blueprint),
      json.recordedExercises.map(fromRecordedExerciseJSON),
      fromLocalDateJSON(json.date),
      json.bodyweight ? Weight.fromJSON(json.bodyweight) : undefined,
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
        .with(P.instanceOf(CardioExerciseBlueprint), (ce) =>
          RecordedCardioExercise.empty(ce),
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
      weightEqual(this.bodyweight, other.bodyweight) &&
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
      type: 'Session',
      blueprint: this.blueprint.toPOJO(),
      bodyweight: this.bodyweight,
      date: this.date,
      id: this.id,
      recordedExercises: this.recordedExercises.map((x) => x.toPOJO()),
    };
  }
  toJSON(): SessionJSON {
    return {
      blueprint: this.blueprint.toJSON(),
      bodyweight: this.bodyweight?.toJSON(),
      date: toLocalDateJSON(this.date),
      id: this.id,
      recordedExercises: this.recordedExercises.map((x) => x.toJSON()),
    };
  }

  toDao(): LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2 {
    return new LiftLog.Ui.Models.SessionHistoryDao.SessionDaoV2({
      id: toUuidDao(this.id),
      sessionName: this.blueprint.name,
      blueprintNotes: this.blueprint.notes,
      recordedExercises: this.recordedExercises.map((x) => x.toDao()),
      date: toDateOnlyDao(this.date),
      bodyweightValue: this.bodyweight
        ? toDecimalDao(this.bodyweight.value)
        : null,
      bodyweightUnit: this.bodyweight
        ? toWeightUnitDao(this.bodyweight.unit)
        : LiftLog.Ui.Models.WeightUnit.NIL,
    });
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
    const cardioExerciseWithRunningTimer = recordedExercises.find(
      (x) =>
        x instanceof RecordedCardioExercise &&
        x.sets.some((s) => s.currentBlockStartTime),
    );
    if (cardioExerciseWithRunningTimer) {
      return cardioExerciseWithRunningTimer;
    }
    const latestExerciseIndex = Enumerable.from(recordedExercises)
      .select(indexed)
      .where((x) => x.item.isStarted)
      .orderByDescending(({ item }) => item.latestTime, TemporalComparer)
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
        const epochSecond = latestTime?.toEpochSecond() ?? Number.MIN_VALUE;

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
      .maxBy((x) => x.latestTime?.toInstant().toEpochMilli());
  }

  get latestWeightedExercise(): RecordedWeightedExercise | undefined {
    return Enumerable.from(this.recordedExercises)
      .where((x) => x.isStarted)
      .where((x) => x instanceof RecordedWeightedExercise)
      .defaultIfEmpty(undefined)
      .maxBy((x) => x.latestTime?.toInstant().toEpochMilli());
  }

  get firstExercise(): RecordedExercise | undefined {
    return Enumerable.from(this.recordedExercises)
      .where((x) => x.isStarted)
      .defaultIfEmpty(undefined)
      .minBy((x) => x.latestTime?.toInstant().toEpochMilli());
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
        { type: 'RecordedCardioExercise' },
        P.instanceOf(RecordedCardioExercise),
      ),
      RecordedCardioExercise.fromPOJO,
    )
    .with(
      P.union(
        { type: 'RecordedWeightedExercise' },
        P.instanceOf(RecordedWeightedExercise),
      ),
      RecordedWeightedExercise.fromPOJO,
    )
    .exhaustive();
}

function fromRecordedExerciseJSON(
  pojo: RecordedExerciseJSON,
): RecordedExercise {
  return match(pojo)
    .with({ type: 'RecordedCardioExercise' }, RecordedCardioExercise.fromJSON)
    .with(
      { type: 'RecordedWeightedExercise' },
      RecordedWeightedExercise.fromJSON,
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

export interface RecordedCardioExerciseSetPOJO {
  readonly type: 'RecordedCardioExerciseSet';
  readonly blueprint: CardioExerciseSetBlueprintPOJO;
  readonly completionDateTime: OffsetDateTime | undefined;
  readonly duration: Duration | undefined;
  readonly distance: Distance | undefined;
  readonly resistance: BigNumber | undefined;
  readonly incline: BigNumber | undefined;
  readonly weight: Weight | undefined;
  readonly steps: number | undefined;

  readonly currentBlockStartTime: OffsetDateTime | undefined;
}

export class RecordedCardioExerciseSet {
  constructor(
    readonly blueprint: CardioExerciseSetBlueprint,
    readonly completionDateTime: OffsetDateTime | undefined,
    readonly duration: Duration | undefined,
    readonly distance: Distance | undefined,
    readonly resistance: BigNumber | undefined,
    readonly incline: BigNumber | undefined,
    readonly weight: Weight | undefined,
    readonly steps: number | undefined,
    /**
     * Describes the start time of a currently running timer. This is not persisted
     */
    readonly currentBlockStartTime: OffsetDateTime | undefined,
  ) {}
  static empty(
    blueprint: CardioExerciseSetBlueprint,
  ): RecordedCardioExerciseSet {
    return new RecordedCardioExerciseSet(
      blueprint,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    );
  }

  static fromPOJO(
    pojo:
      | Omit<RecordedCardioExerciseSetPOJO, 'type'>
      | RecordedCardioExerciseSet,
  ): RecordedCardioExerciseSet {
    return new RecordedCardioExerciseSet(
      CardioExerciseSetBlueprint.fromPOJO(pojo.blueprint),
      pojo.completionDateTime,
      pojo.duration,
      pojo.distance,
      pojo.resistance,
      pojo.incline,
      pojo.weight,
      pojo.steps,
      pojo.currentBlockStartTime,
    );
  }
  static fromJSON(
    json: RecordedCardioExerciseSetJSON,
  ): RecordedCardioExerciseSet {
    return new RecordedCardioExerciseSet(
      CardioExerciseSetBlueprint.fromJSON(json.blueprint),
      json.completionDateTime
        ? fromOffsetDateTimeJSON(json.completionDateTime)
        : undefined,
      json.duration ? fromDurationJSON(json.duration) : undefined,
      json.distance ? fromDistanceJSON(json.distance) : undefined,
      json.resistance != undefined
        ? fromBigNumberJSON(json.resistance)
        : undefined,
      json.incline != undefined ? fromBigNumberJSON(json.incline) : undefined,
      json.weight ? Weight.fromJSON(json.weight) : undefined,
      json.steps,
      undefined,
    );
  }

  get isCompletelyFilled(): boolean {
    return (
      (this.blueprint.trackDuration || this.blueprint.target.type === 'time'
        ? !!this.duration && !this.duration.equals(Duration.ZERO)
        : true) &&
      (this.blueprint.trackDistance || this.blueprint.target.type === 'distance'
        ? !!this.distance
        : true) &&
      (this.blueprint.trackSteps ? this.steps !== undefined : true) &&
      (this.blueprint.trackResistance ? !!this.resistance : true) &&
      (this.blueprint.trackWeight ? !!this.weight : true) &&
      (this.blueprint.trackIncline ? !!this.incline : true) &&
      !this.currentBlockStartTime
    );
  }

  toPOJO(): RecordedCardioExerciseSetPOJO {
    return {
      type: 'RecordedCardioExerciseSet',
      blueprint: this.blueprint.toPOJO(),
      completionDateTime: this.completionDateTime,
      duration: this.duration,
      distance: this.distance,
      resistance: this.resistance,
      incline: this.incline,
      weight: this.weight,
      steps: this.steps,
      currentBlockStartTime: this.currentBlockStartTime,
    };
  }
  toJSON(): RecordedCardioExerciseSetJSON {
    return {
      blueprint: this.blueprint.toJSON(),
      completionDateTime: this.completionDateTime
        ? toOffsetDateTimeJSON(this.completionDateTime)
        : undefined,
      duration: this.duration ? toDurationJSON(this.duration) : undefined,
      distance:
        this.distance !== undefined ? toDistanceJSON(this.distance) : undefined,
      resistance:
        this.resistance !== undefined
          ? toBigNumberJSON(this.resistance)
          : undefined,
      incline:
        this.incline !== undefined ? toBigNumberJSON(this.incline) : undefined,
      weight: this.weight?.toJSON(),
      steps: this.steps,
    };
  }

  toDao(): LiftLog.Ui.Models.SessionHistoryDao.IRecordedCardioExerciseSetDao {
    return {
      blueprint: this.blueprint.toDao(),
      completionDateTime: toDateTimeDao(this.completionDateTime),
      distanceUnit: toStringValue(this.distance?.unit),
      distanceValue: this.distance ? toDecimalDao(this.distance.value) : null,
      duration: toDurationDao(this.duration),
      incline: this.incline ? toDecimalDao(this.incline) : null,
      resistance: this.resistance ? toDecimalDao(this.resistance) : null,
      weight: this.weight ? this.weight.toDao() : null,
      steps: this.steps !== undefined ? { value: this.steps } : null,
    };
  }

  with(other: Partial<RecordedCardioExerciseSet>): RecordedCardioExerciseSet {
    return new RecordedCardioExerciseSet(
      other.blueprint ?? this.blueprint,
      other.completionDateTime ?? this.completionDateTime,
      other.duration ?? this.duration,
      other.distance ?? this.distance,
      other.resistance ?? this.resistance,
      other.incline ?? this.incline,
      other.weight ?? this.weight,
      other.steps ?? this.steps,
      other.currentBlockStartTime ?? this.currentBlockStartTime,
    );
  }

  equals(other: RecordedCardioExerciseSet): unknown {
    return (
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
      weightEqual(this.weight, other.weight) &&
      this.steps === other.steps
    );
  }
}

export interface RecordedCardioExercisePOJO {
  type: 'RecordedCardioExercise';
  blueprint: CardioExerciseBlueprintPOJO;
  sets: RecordedCardioExerciseSetPOJO[];
  notes: string | undefined;
}
export class RecordedCardioExercise {
  constructor(
    readonly blueprint: CardioExerciseBlueprint,
    readonly sets: RecordedCardioExerciseSet[],
    readonly notes: string | undefined,
  ) {
    if (!sets.length) {
      throw new Error('Cardio exercise must have at least one set');
    }
  }

  static fromPOJO(
    pojo: Omit<RecordedCardioExercisePOJO, 'type'> | RecordedCardioExercise,
  ): RecordedCardioExercise {
    return new RecordedCardioExercise(
      CardioExerciseBlueprint.fromPOJO(pojo.blueprint),
      pojo.sets.map((x) => RecordedCardioExerciseSet.fromPOJO(x)),
      pojo.notes,
    );
  }
  static fromJSON(pojo: RecordedCardioExerciseJSON): RecordedCardioExercise {
    return new RecordedCardioExercise(
      CardioExerciseBlueprint.fromJSON(pojo.blueprint),
      pojo.sets.map((x) => RecordedCardioExerciseSet.fromJSON(x)),
      pojo.notes,
    );
  }

  static empty(blueprint: CardioExerciseBlueprint): RecordedCardioExercise {
    return new RecordedCardioExercise(
      blueprint,
      blueprint.sets.map((x) => RecordedCardioExerciseSet.empty(x)),
      undefined,
    );
  }

  get currentSetIndex() {
    return this.sets.findIndex((x) => !x.isCompletelyFilled);
  }

  get duration(): Duration | undefined {
    return this.sets.reduce(
      (accum, set) => accum.plus(set.duration ?? Duration.ZERO),
      Duration.ZERO,
    );
  }

  get isComplete(): boolean {
    return this.sets.every((x) => x.isCompletelyFilled);
  }

  get isStarted() {
    return this.sets.some((x) => !!x.completionDateTime);
  }

  get latestTime(): OffsetDateTime | undefined {
    return this.sets
      .map((x) => x.completionDateTime)
      .filter((x) => x)
      .sort(TemporalComparer)
      .at(-1);
  }

  get earliestTime(): OffsetDateTime | undefined {
    return this.sets
      .map((x) => x.completionDateTime)
      .filter((x) => x)
      .sort(TemporalComparer)
      .at(0);
  }

  withNothingCompleted(): RecordedCardioExercise {
    return this.with({
      notes: undefined,
      sets: this.blueprint.sets.map((s) => RecordedCardioExerciseSet.empty(s)),
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
      this.sets.every((set, index) => set.equals(other.sets[index])) &&
      this.notes === other.notes
    );
  }

  with(
    other:
      | Partial<RecordedCardioExercisePOJO>
      | Partial<RecordedCardioExercise>,
  ): RecordedCardioExercise {
    return new RecordedCardioExercise(
      CardioExerciseBlueprint.fromPOJO(other.blueprint ?? this.blueprint),
      other.sets?.map((x) => RecordedCardioExerciseSet.fromPOJO(x)) ??
        this.sets,
      other.notes ?? this.notes,
    );
  }

  toPOJO(): RecordedCardioExercisePOJO {
    return {
      type: 'RecordedCardioExercise',
      blueprint: this.blueprint.toPOJO(),
      sets: this.sets.map((x) => x.toPOJO()),
      notes: this.notes,
    };
  }

  toJSON(): RecordedCardioExerciseJSON {
    return {
      type: 'RecordedCardioExercise',
      blueprint: this.blueprint.toJSON(),
      sets: this.sets.map((x) => x.toJSON()),
      notes: this.notes,
    };
  }

  toDao(): LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2 {
    return new LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2({
      exerciseBlueprint: this.blueprint.toDao(),
      notes: toStringValue(this.notes),
      type: LiftLog.Ui.Models.SessionBlueprintDao.ExerciseType.CARDIO,
      cardioSets: this.sets.map((x) => x.toDao()),
    });
  }
}

export interface RecordedWeightedExercisePOJO {
  type: 'RecordedWeightedExercise';
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
      | Omit<RecordedWeightedExercisePOJO, 'type'>
      | RecordedWeightedExercise,
  ): RecordedWeightedExercise {
    return new RecordedWeightedExercise(
      WeightedExerciseBlueprint.fromPOJO(fromPOJO.blueprint),
      fromPOJO.potentialSets.map((x) => PotentialSet.fromPOJO(x)),
      fromPOJO.notes,
    );
  }
  static fromJSON(
    json: RecordedWeightedExerciseJSON,
  ): RecordedWeightedExercise {
    return new RecordedWeightedExercise(
      WeightedExerciseBlueprint.fromJSON(json.blueprint),
      json.potentialSets.map((x) => PotentialSet.fromJSON(x)),
      json.notes,
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
      type: 'RecordedWeightedExercise',
      blueprint: this.blueprint.toPOJO(),
      potentialSets: this.potentialSets.map((x) => x.toPOJO()),
      notes: this.notes,
    };
  }

  toJSON(): RecordedWeightedExerciseJSON {
    return {
      type: 'RecordedWeightedExercise',
      blueprint: this.blueprint.toJSON(),
      potentialSets: this.potentialSets.map((x) => x.toJSON()),
      notes: this.notes,
    };
  }

  toDao(): LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2 {
    return new LiftLog.Ui.Models.SessionHistoryDao.RecordedExerciseDaoV2({
      exerciseBlueprint: this.blueprint.toDao(),
      notes: toStringValue(this.notes),
      type: LiftLog.Ui.Models.SessionBlueprintDao.ExerciseType.WEIGHTED,
      potentialSets: this.potentialSets.map((x) => x.toDao()),
    });
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

  get currentSetIndex() {
    return this.potentialSets.findIndex((x) => !x.set);
  }

  get isStarted() {
    return !!this.firstRecordedSet;
  }

  get duration(): Duration | undefined {
    return this.latestTime && this.earliestTime
      ? Duration.between(this.earliestTime, this.latestTime)
      : undefined;
  }

  get latestTime(): OffsetDateTime | undefined {
    return this.lastRecordedSet?.set?.completionDateTime;
  }

  get earliestTime(): OffsetDateTime | undefined {
    return this.firstRecordedSet?.set?.completionDateTime;
  }

  get lastRecordedSet(): PotentialSet | undefined {
    const result = Enumerable.from(this.potentialSets)
      .orderByDescending((x) => x.set?.completionDateTime, TemporalComparer)
      .firstOrDefault((x) => x.set !== undefined);
    return result;
  }

  get firstRecordedSet(): PotentialSet | undefined {
    const result = Enumerable.from(this.potentialSets)
      .orderBy((x) => x.set?.completionDateTime, TemporalComparer)
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
  type: 'RecordedSet';
  repsCompleted: number;
  completionDateTime: OffsetDateTime;
}

export class RecordedSet {
  readonly repsCompleted: number;
  readonly completionDateTime: OffsetDateTime;

  /**
   * @deprecated please use full constructor. Here only for serialization
   */
  constructor();
  constructor(repsCompleted: number, completionDateTime: OffsetDateTime);
  constructor(repsCompleted?: number, completionDateTime?: OffsetDateTime) {
    this.repsCompleted = repsCompleted!;
    this.completionDateTime = completionDateTime!;
  }

  static fromPOJO(pojo: DeepOmit<RecordedSetPOJO, 'type'>): RecordedSet {
    return new RecordedSet(pojo.repsCompleted, pojo.completionDateTime);
  }

  static fromJSON(pojo: RecordedSetJSON): RecordedSet {
    return new RecordedSet(
      pojo.repsCompleted,
      fromOffsetDateTimeJSON(pojo.completionDateTime),
    );
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
      type: 'RecordedSet',
      repsCompleted: this.repsCompleted,
      completionDateTime: this.completionDateTime,
    };
  }

  toJSON(): RecordedSetJSON {
    return {
      repsCompleted: this.repsCompleted,
      completionDateTime: toOffsetDateTimeJSON(this.completionDateTime),
    };
  }

  toDao(): LiftLog.Ui.Models.SessionHistoryDao.RecordedSetDaoV2 {
    return new LiftLog.Ui.Models.SessionHistoryDao.RecordedSetDaoV2({
      repsCompleted: this.repsCompleted,
      completionDate: toDateOnlyDao(this.completionDateTime.toLocalDate()),
      completionTime: toTimeOnlyDao(this.completionDateTime.toLocalTime()),
      completionOffset: {
        totalSeconds: this.completionDateTime.offset().totalSeconds(),
      },
    });
  }
}

export interface PotentialSetPOJO {
  type: 'PotentialSet';
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
    pojo: DeepOmit<PotentialSetPOJO, 'type'> | PotentialSet,
  ): PotentialSet {
    return new PotentialSet(
      pojo.set ? RecordedSet.fromPOJO(pojo.set) : undefined,
      pojo.weight,
    );
  }
  static fromJSON(pojo: PotentialSetJSON): PotentialSet {
    return new PotentialSet(
      pojo.set ? RecordedSet.fromJSON(pojo.set) : undefined,
      Weight.fromJSON(pojo.weight),
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
      type: 'PotentialSet',
      set: this.set?.toPOJO(),
      weight: this.weight,
    };
  }
  toJSON(): PotentialSetJSON {
    return {
      set: this.set?.toJSON(),
      weight: this.weight.toJSON(),
    };
  }

  toDao(): LiftLog.Ui.Models.SessionHistoryDao.PotentialSetDaoV2 {
    return new LiftLog.Ui.Models.SessionHistoryDao.PotentialSetDaoV2({
      recordedSet: this.set?.toDao() ?? null,
      weightValue: toDecimalDao(this.weight.value),
      weightUnit: toWeightUnitDao(this.weight.unit),
    });
  }
}

function weightEqual(a: Weight | undefined, b: Weight | undefined) {
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

export function toSessionHistoryDao(
  model: Record<string, SessionPOJO>,
): LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2 {
  return new LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2({
    completedSessions: Enumerable.from(model)
      .select((x) => Session.fromPOJO(x.value))
      .select((x) => x.toDao())
      .toArray(),
  });
}

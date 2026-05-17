import { LiftLog } from '@/gen/proto';
import {
  WeightedExerciseBlueprint,
  SessionBlueprint,
  CardioExerciseBlueprint,
  ExerciseBlueprint,
  Distance,
  CardioExerciseSetBlueprint,
  fromDistanceJSON,
  toDistanceJSON,
} from '@/models/blueprint-models';
import { TemporalComparer } from '@/models/comparers';
import { toWeightUnitDao, Weight, WeightUnit } from '@/models/weight';
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

export type WeightAppliesTo = 'thisSet' | 'uncompletedSets' | 'allSets';

export class Session {
  constructor(
    readonly id: string,
    readonly blueprint: SessionBlueprint,
    readonly recordedExercises: RecordedExercise[],
    readonly date: LocalDate,
    readonly bodyweight: Weight | undefined,
    readonly restTimerStartTime: OffsetDateTime | undefined,
  ) {}
  get duration(): Duration | undefined {
    return this.lastExercise?.latestTime && this.firstExercise?.earliestTime
      ? Duration.between(
          this.firstExercise.earliestTime,
          this.lastExercise.latestTime,
        )
      : undefined;
  }

  static fromJSON(json: SessionJSON): Session {
    return new Session(
      json.id,
      SessionBlueprint.fromJSON(json.blueprint),
      json.recordedExercises.map(fromRecordedExerciseJSON),
      fromLocalDateJSON(json.date),
      json.bodyweight ? Weight.fromJSON(json.bodyweight) : undefined,
      undefined,
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
      undefined,
    );
  }

  withNoNilWeights(fallbackWeightUnit: WeightUnit): Session | undefined {
    return this.with({
      recordedExercises: this.recordedExercises.map((re) =>
        re instanceof RecordedWeightedExercise
          ? re.with({
              potentialSets: re.potentialSets.map((ps) =>
                ps.with({
                  weight: ps.weight.with({
                    unit:
                      ps.weight.unit === 'nil'
                        ? fallbackWeightUnit
                        : ps.weight.unit,
                  }),
                }),
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
      'id' in other ? (other.id ?? this.id) : this.id,
      'blueprint' in other
        ? (other.blueprint ?? this.blueprint)
        : this.blueprint,
      'recordedExercises' in other
        ? (other.recordedExercises ?? this.recordedExercises)
        : this.recordedExercises,
      'date' in other ? (other.date ?? this.date) : this.date,
      'bodyweight' in other ? other.bodyweight : this.bodyweight,
      'restTimerStartTime' in other
        ? other.restTimerStartTime
        : this.restTimerStartTime,
    );
  }

  withEditedExercise(
    exerciseIndex: number,
    newBlueprint: ExerciseBlueprint,
    useImperialUnits: boolean,
  ): Session {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let session: Session = this;
    const existingExercise = session.recordedExercises[exerciseIndex];

    session = session.with({
      blueprint: session.blueprint.with({
        exercises: session.blueprint.exercises.with(
          exerciseIndex,
          newBlueprint,
        ),
      }),
    });
    if (existingExercise.blueprint.type !== newBlueprint.type) {
      session = session.withExercise(
        exerciseIndex,
        createEmptyRecordedExercise(
          newBlueprint,
          useImperialUnits ? 'pounds' : 'kilograms',
        ),
      );
    } else {
      const weightedExistingExercise =
        session.recordedExercises[exerciseIndex].type ===
        'RecordedWeightedExercise'
          ? session.recordedExercises[exerciseIndex]
          : undefined;
      if (weightedExistingExercise) {
        session = session.withExercise(
          exerciseIndex,
          weightedExistingExercise.with({
            blueprint: newBlueprint as WeightedExerciseBlueprint,
            potentialSets: Enumerable.range(
              0,
              (newBlueprint as WeightedExerciseBlueprint).sets,
            )
              .select(
                (index) =>
                  weightedExistingExercise.potentialSets[index] ?? {
                    weight: weightedExistingExercise.maxWeight,
                    set: undefined,
                  },
              )
              .toArray(),
          }),
        );
      }

      const cardioExistingExercise =
        session.recordedExercises[exerciseIndex].type ===
        'RecordedCardioExercise'
          ? session.recordedExercises[exerciseIndex]
          : undefined;

      if (cardioExistingExercise) {
        session = session.withExercise(
          exerciseIndex,
          cardioExistingExercise.with({
            blueprint: newBlueprint as CardioExerciseBlueprint,
            sets: (newBlueprint as CardioExerciseBlueprint).sets.map((set, i) =>
              RecordedCardioExerciseSet.empty(set).with({
                // Basically allows us to use values from set, even if there are more sets now and it would be undefined
                ...cardioExistingExercise.sets[i],
                blueprint: set,
              }),
            ),
          }),
        );
      }
    }
    return session;
  }

  withAddedExercise(
    exercise: ExerciseBlueprint,
    useImperialUnits: boolean,
  ): Session {
    return this.with({
      blueprint: this.blueprint.with({
        exercises: this.blueprint.exercises.concat(exercise),
      }),
      recordedExercises: this.recordedExercises.concat(
        createEmptyRecordedExercise(
          exercise,
          useImperialUnits ? 'pounds' : 'kilograms',
        ),
      ),
    });
  }

  withUpdatedDate(date: LocalDate): Session {
    const originalDate = this.date;
    const newDate = date;

    // Gather all unique, non-null completion dates from all sets
    const allCompletionDates = this.recordedExercises
      .flatMap((re) =>
        re.type === 'RecordedWeightedExercise'
          ? re.potentialSets.map((ps) =>
              ps.set?.completionDateTime?.toLocalDate(),
            )
          : re.sets.map((s) => s.completionDateTime?.toLocalDate()),
      )
      .filter((d): d is LocalDate => d !== undefined);

    // If all sets have the same completion date, use absolute date
    const useAbsoluteDate =
      allCompletionDates.length > 0 &&
      new Set(allCompletionDates.map((d) => d.toString())).size === 1;

    function getAdjustedDate(setDate: LocalDate): LocalDate {
      if (useAbsoluteDate) {
        return newDate;
      }
      // Maintain relative offset if sets cross midnight
      const dayOffset = setDate.toEpochDay() - originalDate.toEpochDay();
      return newDate.plusDays(dayOffset);
    }

    // Update all sets' completionDateTime
    const newExercises = this.recordedExercises.map((re) => {
      if (re.type === 'RecordedWeightedExercise') {
        return re.withAllSets((ps) => {
          if (ps.set && ps.set.completionDateTime) {
            const setDate = ps.set.completionDateTime.toLocalDate();
            return ps.with({
              set: ps.set.with({
                completionDateTime: ps.set.completionDateTime
                  .toLocalTime()
                  .atDate(getAdjustedDate(setDate))
                  .atOffset(ps.set.completionDateTime.offset()),
              }),
            });
          }
          return ps;
        });
      } else {
        return re.withAllSets((set) => {
          if (set && set.completionDateTime) {
            const setDate = set.completionDateTime.toLocalDate();
            return set.with({
              completionDateTime: set.completionDateTime
                .toLocalTime()
                .atDate(getAdjustedDate(setDate))
                .atOffset(set.completionDateTime.offset()),
            });
          }
          return set;
        });
      }
    });

    return this.with({
      recordedExercises: newExercises,
      date,
    });
  }

  withNothingCompleted(): Session {
    return this.with({
      recordedExercises: this.recordedExercises.map((re) =>
        re.withNothingCompleted(),
      ),
    });
  }

  // TODO we should update the rest timer time when we call this
  withCycledExerciseReps(
    exerciseIndex: number,
    setIndex: number,
    time: OffsetDateTime,
  ): Session {
    const weightedRecorded = this.recordedExercises[exerciseIndex];
    if (weightedRecorded.type !== 'RecordedWeightedExercise') {
      return this;
    }
    let newDate = this.date;
    if (!this.isStarted) {
      newDate = time.toLocalDate();
    }
    return this.with({
      date: newDate,
      recordedExercises: this.recordedExercises.with(
        exerciseIndex,
        weightedRecorded.withCycledRepCount(setIndex, time),
      ),
    });
  }

  withExercise(exerciseIndex: number, exercise: RecordedExercise): Session {
    return this.with({
      recordedExercises: this.recordedExercises.with(exerciseIndex, exercise),
      blueprint: this.blueprint.with({
        exercises: this.blueprint.exercises.with(
          exerciseIndex,
          exercise.blueprint,
        ),
      }),
    });
  }

  withRemovedExercise(exerciseIndex: number): Session {
    return this.with({
      recordedExercises: this.recordedExercises.toSpliced(exerciseIndex, 1),
      blueprint: this.blueprint.with({
        exercises: this.blueprint.exercises.toSpliced(exerciseIndex, 1),
      }),
    });
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

  get restTimerEndTime(): OffsetDateTime | undefined {
    if (!this.restTimerStartTime) {
      return undefined;
    }
    const exercise = this.lastExercise;
    if (
      this.nextExercise &&
      exercise &&
      exercise.latestTime &&
      exercise instanceof RecordedWeightedExercise
    ) {
      const repsPerSet = exercise.blueprint.repsPerSet;
      const { minRest, failureRest } = exercise.blueprint.restBetweenSets;

      const rest = match(exercise.lastRecordedSet)
        .with(
          { set: { repsCompleted: P.when((x) => x >= repsPerSet) } },
          () => minRest,
        )
        .with(
          { set: { repsCompleted: P.when((x) => x < repsPerSet) } },
          () => failureRest,
        )
        .otherwise(() => Duration.ZERO);

      if (rest.equals(Duration.ZERO)) {
        return undefined;
      }
      return this.restTimerStartTime.plus(rest);
    }
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

export function fromRecordedExerciseJSON(
  json: RecordedExerciseJSON,
): RecordedExercise {
  return match(json)
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
      json.resistance !== undefined
        ? fromBigNumberJSON(json.resistance)
        : undefined,
      json.incline !== undefined ? fromBigNumberJSON(json.incline) : undefined,
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
      'blueprint' in other
        ? (other.blueprint ?? this.blueprint)
        : this.blueprint,
      'completionDateTime' in other
        ? other.completionDateTime
        : this.completionDateTime,
      'duration' in other ? other.duration : this.duration,
      'distance' in other ? other.distance : this.distance,
      'resistance' in other ? other.resistance : this.resistance,
      'incline' in other ? other.incline : this.incline,
      'weight' in other ? other.weight : this.weight,
      'steps' in other ? other.steps : this.steps,
      'currentBlockStartTime' in other
        ? other.currentBlockStartTime
        : this.currentBlockStartTime,
    );
  }

  withCompletionTimeIfCompleted(
    time: OffsetDateTime,
  ): RecordedCardioExerciseSet {
    const hasData = !!(
      this.distance ||
      (this.duration && !this.duration.isZero()) ||
      this.incline ||
      this.resistance
    );
    const newCompletionDateTime = hasData
      ? (this.completionDateTime ?? time)
      : undefined;

    return this.with({ completionDateTime: newCompletionDateTime });
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
export class RecordedCardioExercise {
  readonly type = 'RecordedCardioExercise';
  constructor(
    readonly blueprint: CardioExerciseBlueprint,
    readonly sets: RecordedCardioExerciseSet[],
    readonly notes: string | undefined,
  ) {
    if (!sets.length) {
      throw new Error('Cardio exercise must have at least one set');
    }
  }

  static fromJSON(json: RecordedCardioExerciseJSON): RecordedCardioExercise {
    return new RecordedCardioExercise(
      CardioExerciseBlueprint.fromJSON(json.blueprint),
      json.sets.map((x) => RecordedCardioExerciseSet.fromJSON(x)),
      json.notes,
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

  withSet(
    setIndex: number,
    reducer: (s: RecordedCardioExerciseSet) => RecordedCardioExerciseSet,
  ) {
    return this.with({
      sets: this.sets.with(setIndex, reducer(this.sets[setIndex])),
    });
  }
  withAllSets(
    reducer: (s: RecordedCardioExerciseSet) => RecordedCardioExerciseSet,
  ) {
    return this.with({
      sets: this.sets.map(reducer),
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

  with(other: Partial<RecordedCardioExercise>): RecordedCardioExercise {
    return new RecordedCardioExercise(
      other.blueprint ?? this.blueprint,
      other.sets ?? this.sets,
      other.notes ?? this.notes,
    );
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

export class RecordedWeightedExercise {
  readonly type = 'RecordedWeightedExercise';

  constructor(
    readonly blueprint: WeightedExerciseBlueprint,
    readonly potentialSets: readonly PotentialSet[],
    readonly notes: string | undefined,
  ) {}

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
        .select(() => new PotentialSet(undefined, new Weight(0, unit)))
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

  with(other: Partial<RecordedWeightedExercise>) {
    return new RecordedWeightedExercise(
      'blueprint' in other
        ? (other.blueprint ?? this.blueprint)
        : this.blueprint,
      'potentialSets' in other
        ? (other.potentialSets ?? this.potentialSets)
        : this.potentialSets,
      'notes' in other ? other.notes : this.notes,
    );
  }

  withNothingCompleted(): RecordedWeightedExercise {
    return this.with({
      notes: undefined,
      potentialSets: this.potentialSets.map((ps) =>
        ps.with({ set: undefined }),
      ),
    });
  }

  withCycledRepCount(
    setIndex: number,
    time: OffsetDateTime,
  ): RecordedWeightedExercise {
    return this.withSet(setIndex, (s) =>
      s.with({
        set: match(s.set)
          .returnType<RecordedSet | undefined>()
          .with(
            undefined,
            () => new RecordedSet(this.blueprint.repsPerSet, time),
          )
          .with({ repsCompleted: 0 }, () => undefined)
          .otherwise((x) =>
            x.with({
              repsCompleted: x.repsCompleted - 1,
            }),
          ),
      }),
    );
  }

  withRepCount(
    setIndex: number,
    reps: number | undefined,
    time: OffsetDateTime,
  ): RecordedWeightedExercise {
    return this.withSet(setIndex, (s) =>
      s.with({
        set: reps === undefined ? undefined : new RecordedSet(reps, time),
      }),
    );
  }

  withSet(setIndex: number, reducer: (s: PotentialSet) => PotentialSet) {
    return this.with({
      potentialSets: this.potentialSets.with(
        setIndex,
        reducer(this.potentialSets[setIndex]),
      ),
    });
  }

  withAllSets(reducer: (s: PotentialSet) => PotentialSet) {
    return this.with({
      potentialSets: this.potentialSets.map(reducer),
    });
  }

  withWeight(setIndex: number, weight: Weight, applyTo: WeightAppliesTo) {
    return match(applyTo)
      .with('thisSet', () => this.withSet(setIndex, (s) => s.with({ weight })))
      .with('uncompletedSets', () =>
        this.withAllSets((s) => s.with({ weight: s.set ? s.weight : weight })),
      )
      .with('allSets', () => this.withAllSets((s) => s.with({ weight })))
      .exhaustive();
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

  get totalWeightLifted(): Weight {
    return this.potentialSets.reduce(
      (accum, set) =>
        accum.plus(set.weight.multipliedBy(set.set?.repsCompleted ?? 0)),
      Weight.NIL,
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

export class RecordedSet {
  constructor(
    readonly repsCompleted: number,
    readonly completionDateTime: OffsetDateTime,
  ) {}

  static fromJSON(json: RecordedSetJSON): RecordedSet {
    return new RecordedSet(
      json.repsCompleted,
      fromOffsetDateTimeJSON(json.completionDateTime),
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
      'repsCompleted' in other ? other.repsCompleted! : this.repsCompleted,
      'completionDateTime' in other
        ? other.completionDateTime!
        : this.completionDateTime,
    );
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

export class PotentialSet {
  readonly set: RecordedSet | undefined;
  readonly weight: Weight;

  constructor(set: RecordedSet | undefined, weight: Weight) {
    this.set = set;
    this.weight = weight;
  }

  static fromJSON(json: PotentialSetJSON): PotentialSet {
    return new PotentialSet(
      json.set ? RecordedSet.fromJSON(json.set) : undefined,
      Weight.fromJSON(json.weight),
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
      'weight' in other ? other.weight! : this.weight,
    );
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
  new SessionBlueprint('', [], ''),
  [],
  LocalDate.MIN,
  undefined,
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
  model: Record<string, Session>,
): LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2 {
  return new LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2({
    completedSessions: Enumerable.from(model)
      .select((x) => x.value.toDao())
      .toArray(),
  });
}

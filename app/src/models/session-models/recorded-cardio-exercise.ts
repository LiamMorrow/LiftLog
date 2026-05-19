import { LiftLog } from '@/gen/proto';
import {
  CardioExerciseBlueprint,
  CardioExerciseSetBlueprint,
  Distance,
  fromDistanceJSON,
  toDistanceJSON,
} from '@/models/blueprint-models';
import { TemporalComparer } from '@/models/comparers';
import { RecordedExercise } from '@/models/session-models/recorded-exercise';
import {
  toDateTimeDao,
  toDecimalDao,
  toDurationDao,
  toStringValue,
} from '@/models/storage/conversions.to-dao';
import {
  RecordedCardioExerciseJSON,
  RecordedCardioExerciseSetJSON,
  fromBigNumberJSON,
  fromDurationJSON,
  fromOffsetDateTimeJSON,
  toBigNumberJSON,
  toDurationJSON,
  toOffsetDateTimeJSON,
} from '@/models/storage/versions/latest';
import { Weight } from '@/models/weight';
import { Duration, OffsetDateTime } from '@js-joda/core';
import { distanceEqual, equal } from './helpers';
import BigNumber from 'bignumber.js';

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
      equal(this.weight, other.weight) &&
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
    if (other.type !== this.type) {
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

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
  static empty(blueprint: CardioExerciseSetBlueprint): RecordedCardioExerciseSet {
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

  static fromJSON(json: RecordedCardioExerciseSetJSON): RecordedCardioExerciseSet {
    return new RecordedCardioExerciseSet(
      CardioExerciseSetBlueprint.fromJSON(json.blueprint),
      json.completionDateTime ? fromOffsetDateTimeJSON(json.completionDateTime) : undefined,
      json.duration ? fromDurationJSON(json.duration) : undefined,
      json.distance ? fromDistanceJSON(json.distance) : undefined,
      json.resistance !== undefined ? fromBigNumberJSON(json.resistance) : undefined,
      json.incline !== undefined ? fromBigNumberJSON(json.incline) : undefined,
      json.weight ? Weight.fromJSON(json.weight) : undefined,
      json.steps,
      undefined,
    );
  }

  get isCompletelyFilled(): boolean {
    return (
      (this.tracksDuration ? this.duration !== undefined : true) &&
      (this.tracksDistance ? this.distance !== undefined : true) &&
      (this.blueprint.trackSteps ? this.steps !== undefined : true) &&
      (this.blueprint.trackResistance ? this.resistance !== undefined : true) &&
      (this.blueprint.trackWeight ? this.weight !== undefined : true) &&
      (this.blueprint.trackIncline ? this.incline !== undefined : true) &&
      !this.currentBlockStartTime
    );
  }

  /** A time target implies its duration is tracked, whether or not the flag says so. */
  get tracksDuration(): boolean {
    return this.blueprint.trackDuration || this.blueprint.target.type === 'time';
  }

  /** A distance target implies its distance is tracked, whether or not the flag says so. */
  get tracksDistance(): boolean {
    return this.blueprint.trackDistance || this.blueprint.target.type === 'distance';
  }

  get isTimerRunning(): boolean {
    return this.currentBlockStartTime !== undefined;
  }

  earnsRest(previous: RecordedCardioExerciseSet | undefined): boolean {
    return (
      this.blueprint.restBetweenSets !== undefined &&
      previous !== undefined &&
      previous.isCompletelyFilled !== this.isCompletelyFilled
    );
  }

  elapsedAt(now: OffsetDateTime): Duration {
    const banked = this.duration ?? Duration.ZERO;
    return this.currentBlockStartTime ? banked.plus(Duration.between(this.currentBlockStartTime, now)) : banked;
  }

  withTimerStarted(now: OffsetDateTime): RecordedCardioExerciseSet {
    return this.with({ currentBlockStartTime: now });
  }

  /** A re-anchor can race the user's own stop, and must never restart a clock they stopped. */
  withTimerReanchored(now: OffsetDateTime): RecordedCardioExerciseSet {
    if (!this.currentBlockStartTime) {
      return this;
    }
    return this.with({ duration: this.elapsedAt(now), currentBlockStartTime: now });
  }

  /** The target is a goal, not a bound: a set run long records what it ran to, not what it aimed for. */
  withTimerStopped(now: OffsetDateTime): RecordedCardioExerciseSet {
    if (!this.currentBlockStartTime) {
      return this;
    }
    return this.with({
      duration: this.elapsedAt(now),
      currentBlockStartTime: undefined,
    });
  }

  toJSON(): RecordedCardioExerciseSetJSON {
    return {
      blueprint: this.blueprint.toJSON(),
      completionDateTime: this.completionDateTime ? toOffsetDateTimeJSON(this.completionDateTime) : undefined,
      duration: this.duration ? toDurationJSON(this.duration) : undefined,
      distance: this.distance !== undefined ? toDistanceJSON(this.distance) : undefined,
      resistance: this.resistance !== undefined ? toBigNumberJSON(this.resistance) : undefined,
      incline: this.incline !== undefined ? toBigNumberJSON(this.incline) : undefined,
      weight: this.weight?.toJSON(),
      steps: this.steps,
    };
  }

  with(other: Partial<RecordedCardioExerciseSet>): RecordedCardioExerciseSet {
    return new RecordedCardioExerciseSet(
      'blueprint' in other ? (other.blueprint ?? this.blueprint) : this.blueprint,
      'completionDateTime' in other ? other.completionDateTime : this.completionDateTime,
      'duration' in other ? other.duration : this.duration,
      'distance' in other ? other.distance : this.distance,
      'resistance' in other ? other.resistance : this.resistance,
      'incline' in other ? other.incline : this.incline,
      'weight' in other ? other.weight : this.weight,
      'steps' in other ? other.steps : this.steps,
      'currentBlockStartTime' in other ? other.currentBlockStartTime : this.currentBlockStartTime,
    );
  }

  withCompletionTimeIfCompleted(time: OffsetDateTime): RecordedCardioExerciseSet {
    const hasData =
      this.duration !== undefined ||
      this.distance !== undefined ||
      this.incline !== undefined ||
      this.resistance !== undefined ||
      this.weight !== undefined ||
      this.steps !== undefined;
    const newCompletionDateTime = hasData ? (this.completionDateTime ?? time) : undefined;

    return this.with({ completionDateTime: newCompletionDateTime });
  }
  equals(other: RecordedCardioExerciseSet | undefined): unknown {
    if (!other) {
      return false;
    }
    return (
      ((this.completionDateTime &&
        other.completionDateTime &&
        this.completionDateTime.equals(other.completionDateTime)) ||
        this.completionDateTime === other.completionDateTime) &&
      ((this.duration && other.duration && this.duration.equals(other.duration)) || this.duration === other.duration) &&
      distanceEqual(this.distance, other.distance) &&
      ((this.resistance && other.resistance && this.resistance.isEqualTo(other.resistance)) ||
        this.resistance === other.resistance) &&
      ((this.incline && other.incline && this.incline.isEqualTo(other.incline)) || this.incline === other.incline) &&
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
    return this.sets.reduce((accum, set) => accum.plus(set.duration ?? Duration.ZERO), Duration.ZERO);
  }

  get isComplete(): boolean {
    return this.sets.every((x) => x.isCompletelyFilled);
  }

  /** The set whose rest is owed — cardio carries its rest per set, not per exercise. */
  get lastCompletedSet(): RecordedCardioExerciseSet | undefined {
    return this.sets.reduce<RecordedCardioExerciseSet | undefined>((latest, set) => {
      if (!set.completionDateTime) return latest;
      if (!latest?.completionDateTime) return set;
      return set.completionDateTime.isAfter(latest.completionDateTime) ? set : latest;
    }, undefined);
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

  withSet(setIndex: number, reducer: (s: RecordedCardioExerciseSet) => RecordedCardioExerciseSet) {
    const existingSet = this.sets[setIndex];
    if (!existingSet) {
      throw new Error('Index out of bounds');
    }
    return this.with({
      sets: this.sets.with(setIndex, reducer(existingSet)),
    });
  }
  withAllSets(reducer: (s: RecordedCardioExerciseSet) => RecordedCardioExerciseSet) {
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
}

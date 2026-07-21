import { Duration, LocalDate } from '@js-joda/core';
import BigNumber from 'bignumber.js';
import { match, P } from 'ts-pattern';
import {
  CardioExerciseBlueprintJSON,
  CardioExerciseSetBlueprintJSON,
  CardioTargetJSON,
  DistanceJSON,
  ExerciseBlueprintJSON,
  IncreaseAllEvenlyProgressiveOverloadJSON,
  IncreaseLowestSetProgressiveOverloadJSON,
  NoProgressiveOverloadJSON,
  ProgramBlueprintJSON,
  ProgressiveOverloadJSON,
  RestJSON,
  SessionBlueprintJSON,
  WeightedExerciseBlueprintJSON,
  fromBigNumberJSON,
  fromDurationJSON,
  fromLocalDateJSON,
  toBigNumberJSON,
  toDurationJSON,
  toLocalDateJSON,
} from '../storage/versions/latest';
import { RecordedWeightedExercise } from '@/models/session-models';
import { assertUnreachable } from '@/utils/assert-unreachable';

export interface ProgramBlueprintPOJO {
  type: 'ProgramBlueprint';
  readonly name: string;
  readonly sessions: SessionBlueprint[];
  lastEdited: LocalDate;
}

export class ProgramBlueprint {
  constructor(
    readonly name: string,
    readonly sessions: SessionBlueprint[],
    readonly lastEdited: LocalDate,
  ) {}

  static fromJSON(json: ProgramBlueprintJSON): ProgramBlueprint {
    return new ProgramBlueprint(
      json.name,
      json.sessions.map(SessionBlueprint.fromJSON),
      fromLocalDateJSON(json.lastEdited),
    );
  }

  static fromPOJO(pojo: Omit<ProgramBlueprintPOJO, 'type'>): ProgramBlueprint {
    return new ProgramBlueprint(pojo.name, pojo.sessions, pojo.lastEdited);
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
      this.sessions.every((session, index) => session.equals(other.sessions[index]))
    );
  }

  toPOJO(): ProgramBlueprintPOJO {
    return {
      type: 'ProgramBlueprint',
      name: this.name,
      sessions: this.sessions,
      lastEdited: this.lastEdited,
    };
  }

  toJSON(): ProgramBlueprintJSON {
    return {
      version: 3,
      name: this.name,
      sessions: this.sessions.map((session) => session.toJSON()),
      lastEdited: toLocalDateJSON(this.lastEdited),
    };
  }

  with(other: Partial<ProgramBlueprint>): ProgramBlueprint {
    return new ProgramBlueprint(
      other.name ?? this.name,
      other.sessions ?? this.sessions,
      other.lastEdited ?? this.lastEdited,
    );
  }
}

export class SessionBlueprint {
  constructor(
    readonly name: string,
    readonly exercises: ExerciseBlueprint[],
    readonly notes: string,
  ) {}

  static fromJSON(json: SessionBlueprintJSON): SessionBlueprint {
    return new SessionBlueprint(json.name, json.exercises.map(fromExerciseBlueprintJSON), json.notes);
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
      this.exercises.every((exercise, index) => exercise.equals(other.exercises[index]))
    );
  }

  toJSON(): SessionBlueprintJSON {
    return {
      version: 3,
      name: this.name,
      exercises: this.exercises.map((exercise) => exercise.toJSON()),
      notes: this.notes,
    };
  }

  with(other: Partial<SessionBlueprint>): SessionBlueprint {
    return new SessionBlueprint(other.name ?? this.name, other.exercises ?? this.exercises, other.notes ?? this.notes);
  }
}

export type ExerciseBlueprint = WeightedExerciseBlueprint | CardioExerciseBlueprint;

function fromExerciseBlueprintJSON(json: ExerciseBlueprintJSON): ExerciseBlueprint {
  return match(json)
    .with({ type: 'CardioExerciseBlueprint' }, CardioExerciseBlueprint.fromJSON)
    .with({ type: 'WeightedExerciseBlueprint' }, WeightedExerciseBlueprint.fromJSON)
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

export type CardioTarget = TimeCardioTarget | DistanceCardioTarget;

export function matchCardioTarget<T>(
  value: CardioTarget,
  matcher: {
    [k in CardioTarget['type']]: (val: Extract<CardioTarget, { type: k }>) => T;
  },
) {
  return match(value).with({ type: 'time' }, matcher.time).with({ type: 'distance' }, matcher.distance).exhaustive();
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
    /** Undefined when the set has no rest. Steady-state cardio does not need one; intervals do. */
    readonly restBetweenSets: Rest | undefined,
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
      undefined,
    );
  }

  static fromJSON(json: CardioExerciseSetBlueprintJSON): CardioExerciseSetBlueprint {
    return new CardioExerciseSetBlueprint(
      fromCardioTargetJSON(json.target),
      json.trackDuration,
      json.trackDistance,
      json.trackResistance,
      json.trackIncline,
      json.trackWeight,
      json.trackSteps,
      json.restBetweenSets ? Rest.fromJSON(json.restBetweenSets) : undefined,
    );
  }

  toJSON(): CardioExerciseSetBlueprintJSON {
    return {
      target: toCardioTargetJSON(this.target),
      trackDistance: this.trackDistance,
      trackDuration: this.trackDuration,
      trackIncline: this.trackIncline,
      trackResistance: this.trackResistance,
      trackWeight: this.trackWeight,
      trackSteps: this.trackSteps,
      restBetweenSets: this.restBetweenSets ? Rest.toJSON(this.restBetweenSets) : undefined,
    };
  }

  equals(other: CardioExerciseSetBlueprint | undefined): boolean {
    if (!other) {
      return false;
    }
    return (
      this.trackDistance === other.trackDistance &&
      this.trackDuration === other.trackDuration &&
      this.trackIncline === other.trackIncline &&
      this.trackResistance === other.trackResistance &&
      this.trackWeight === other.trackWeight &&
      this.trackSteps === other.trackSteps &&
      restEquals(this.restBetweenSets, other.restBetweenSets) &&
      cardioTargetEquals(this.target, other.target)
    );
  }

  with(other: Partial<CardioExerciseSetBlueprint>): CardioExerciseSetBlueprint {
    return new CardioExerciseSetBlueprint(
      other.target ?? this.target,
      other.trackDuration ?? this.trackDuration,
      other.trackDistance ?? this.trackDistance,
      other.trackResistance ?? this.trackResistance,
      other.trackIncline ?? this.trackIncline,
      other.trackWeight ?? this.trackWeight,
      other.trackSteps ?? this.trackSteps,
      'restBetweenSets' in other ? other.restBetweenSets : this.restBetweenSets,
    );
  }
}

export class CardioExerciseBlueprint {
  readonly type = 'CardioExerciseBlueprint';
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
    return new CardioExerciseBlueprint('', [CardioExerciseSetBlueprint.empty()], '', '');
  }

  static fromJSON(json: CardioExerciseBlueprintJSON): CardioExerciseBlueprint {
    return new CardioExerciseBlueprint(
      json.name,
      json.sets.map((x) => CardioExerciseSetBlueprint.fromJSON(x)),
      json.notes,
      json.link,
    );
  }
  equals(other: ExerciseBlueprint | undefined) {
    if (!other) {
      return false;
    }
    if (other === this) {
      return true;
    }
    if ('type' in other && other.type !== this.type) {
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

  toJSON(): CardioExerciseBlueprintJSON {
    return {
      type: 'CardioExerciseBlueprint',
      name: this.name,
      sets: this.sets.map((x) => x.toJSON()),
      notes: this.notes,
      link: this.link,
    };
  }

  with(other: Partial<CardioExerciseBlueprint>): CardioExerciseBlueprint {
    return new CardioExerciseBlueprint(
      other.name ?? this.name,
      other.sets ?? this.sets,
      other.notes ?? this.notes,
      other.link ?? this.link,
    );
  }
}

export class NoProgressiveOverload {
  readonly type = 'NoProgressiveOverload';

  toJSON(): NoProgressiveOverloadJSON {
    return { type: 'NoProgressiveOverload' };
  }

  static fromJSON(_json: NoProgressiveOverloadJSON): NoProgressiveOverload {
    return new NoProgressiveOverload();
  }

  toType(type: ProgressiveOverload['type']) {
    return match(type)
      .with('NoProgressiveOverload', () => this)
      .with('IncreaseAllEvenlyProgressiveOverload', () => new IncreaseAllEvenlyProgressiveOverload(BigNumber('2.5')))
      .with(
        'IncreaseLowestSetProgressiveOverload',
        () => new IncreaseLowestSetProgressiveOverload(BigNumber('2.5'), 'all'),
      )
      .exhaustive();
  }

  equals(other: ProgressiveOverload): boolean {
    return this.type === other.type;
  }

  applyProgressiveOverload(exercise: RecordedWeightedExercise): RecordedWeightedExercise {
    return exercise;
  }

  get weightIncrement(): BigNumber {
    return new BigNumber(2.5);
  }
}

export class IncreaseAllEvenlyProgressiveOverload {
  readonly type = 'IncreaseAllEvenlyProgressiveOverload';
  constructor(readonly amount: BigNumber) {}

  toJSON(): IncreaseAllEvenlyProgressiveOverloadJSON {
    return {
      type: 'IncreaseAllEvenlyProgressiveOverload',
      amount: toBigNumberJSON(this.amount),
    };
  }
  static fromJSON(json: IncreaseAllEvenlyProgressiveOverloadJSON): IncreaseAllEvenlyProgressiveOverload {
    return new IncreaseAllEvenlyProgressiveOverload(fromBigNumberJSON(json.amount));
  }
  toType(type: ProgressiveOverload['type']) {
    return match(type)
      .with('NoProgressiveOverload', () => new NoProgressiveOverload())
      .with('IncreaseAllEvenlyProgressiveOverload', () => this)
      .with('IncreaseLowestSetProgressiveOverload', () => new IncreaseLowestSetProgressiveOverload(this.amount, 'all'))
      .exhaustive();
  }

  with(other: Partial<IncreaseAllEvenlyProgressiveOverload>) {
    return new IncreaseAllEvenlyProgressiveOverload(other.amount ?? this.amount);
  }

  equals(other: ProgressiveOverload): boolean {
    return this.type === other.type && this.amount.isEqualTo(other.amount);
  }
  applyProgressiveOverload(exercise: RecordedWeightedExercise): RecordedWeightedExercise {
    return exercise.withAllSets((s) => s.with({ weight: s.weight.plus(this.amount) }));
  }
  get weightIncrement(): BigNumber {
    return this.amount.isZero() ? new BigNumber(2.5) : this.amount;
  }
}

export type IncreaseStrategy = 'first' | 'middle' | 'last' | 'all';

export class IncreaseLowestSetProgressiveOverload {
  readonly type = 'IncreaseLowestSetProgressiveOverload';
  constructor(
    readonly amount: BigNumber,
    readonly increaseStrategy: IncreaseStrategy,
  ) {}

  toJSON(): IncreaseLowestSetProgressiveOverloadJSON {
    return {
      type: 'IncreaseLowestSetProgressiveOverload',
      amount: toBigNumberJSON(this.amount),
      increaseStrategy: this.increaseStrategy,
    };
  }
  static fromJSON(json: IncreaseLowestSetProgressiveOverloadJSON): IncreaseLowestSetProgressiveOverload {
    return new IncreaseLowestSetProgressiveOverload(fromBigNumberJSON(json.amount), json.increaseStrategy);
  }

  with(other: Partial<IncreaseLowestSetProgressiveOverload>) {
    return new IncreaseLowestSetProgressiveOverload(
      other.amount ?? this.amount,
      other.increaseStrategy ?? this.increaseStrategy,
    );
  }

  toType(type: ProgressiveOverload['type']) {
    return match(type)
      .with('NoProgressiveOverload', () => new NoProgressiveOverload())
      .with('IncreaseAllEvenlyProgressiveOverload', () => new IncreaseAllEvenlyProgressiveOverload(this.amount))
      .with('IncreaseLowestSetProgressiveOverload', () => this)
      .exhaustive();
  }

  equals(other: ProgressiveOverload): boolean {
    return (
      this.type === other.type &&
      this.amount.isEqualTo(other.amount) &&
      this.increaseStrategy === other.increaseStrategy
    );
  }

  applyProgressiveOverload(exercise: RecordedWeightedExercise): RecordedWeightedExercise {
    const lowestSet = [...exercise.potentialSets].sort((a, b) => (a.weight.isGreaterThan(b.weight) ? 1 : -1))[0];
    if (!lowestSet) {
      return exercise;
    }
    if (this.increaseStrategy === 'all') {
      // find all sets which have the same weight as lowest set and increase their weight by amount
      return exercise.potentialSets.reduce(
        (ex, set, index) =>
          set.weight.equals(lowestSet.weight)
            ? ex.withSet(index, (s) => s.with({ weight: s.weight.plus(this.amount) }))
            : ex,
        exercise,
      );
    } else if (this.increaseStrategy === 'middle') {
      const matchingIndices = exercise.potentialSets
        .map((set, index) => ({ set, index }))
        .filter(({ set }) => set.weight.equals(lowestSet.weight))
        .map(({ index }) => index);
      const middleOfAll = (exercise.potentialSets.length - 1) / 2;
      const middleIndex =
        matchingIndices.reduce((closest, index) =>
          Math.abs(index - middleOfAll) < Math.abs(closest - middleOfAll) ? index : closest,
        ) ?? 0;
      return exercise.withSet(middleIndex, (s) => s.with({ weight: s.weight.plus(this.amount) }));
    } else if (this.increaseStrategy === 'first') {
      const index = exercise.potentialSets.findIndex((a) => a.weight.equals(lowestSet.weight));
      return exercise.withSet(index, (s) => s.with({ weight: s.weight.plus(this.amount) }));
    } else if (this.increaseStrategy === 'last') {
      const index = exercise.potentialSets.findLastIndex((a) => a.weight.equals(lowestSet.weight));
      return exercise.withSet(index, (s) => s.with({ weight: s.weight.plus(this.amount) }));
    }
    assertUnreachable(this.increaseStrategy);
  }

  get weightIncrement(): BigNumber {
    return this.amount.isZero() ? new BigNumber(2.5) : this.amount;
  }
}

export type ProgressiveOverload =
  | NoProgressiveOverload
  | IncreaseAllEvenlyProgressiveOverload
  | IncreaseLowestSetProgressiveOverload;

function fromProgressiveOverloadJSON(json: ProgressiveOverloadJSON): ProgressiveOverload {
  return match(json)
    .with({ type: 'NoProgressiveOverload' }, NoProgressiveOverload.fromJSON)
    .with({ type: 'IncreaseAllEvenlyProgressiveOverload' }, IncreaseAllEvenlyProgressiveOverload.fromJSON)
    .with({ type: 'IncreaseLowestSetProgressiveOverload' }, IncreaseLowestSetProgressiveOverload.fromJSON)
    .exhaustive();
}

export interface RepsTarget {
  min: number;
  max: number;
}

/**
 * How a weighted exercise's rep targets are laid out.
 * - `fixed`: every set shares one target.
 * - `range`: every set shares a min–max band.
 * - `perSet`: each set has its own target (a pyramid); `targets` length matches `sets`.
 */
export type RepsConfig =
  | { type: 'fixed'; reps: number }
  | { type: 'range'; min: number; max: number }
  | { type: 'perSet'; targets: RepsTarget[] };

export type RepsType = RepsConfig['type'];

export function formatRepsTarget(target: RepsTarget): string {
  return target.min === target.max ? `${target.max}` : `${target.min}–${target.max}`;
}

export function formatRepsConfig(config: RepsConfig): string {
  return match(config)
    .with({ type: 'fixed' }, (c) => `${c.reps}`)
    .with({ type: 'range' }, (c) => `${c.min}–${c.max}`)
    .with({ type: 'perSet' }, (c) => c.targets.map(formatRepsTarget).join(', '))
    .exhaustive();
}

function cloneRepsConfig(config: RepsConfig): RepsConfig {
  return match(config)
    .with({ type: 'fixed' }, (c) => ({ type: 'fixed' as const, reps: c.reps }))
    .with({ type: 'range' }, (c) => ({ type: 'range' as const, min: c.min, max: c.max }))
    .with({ type: 'perSet' }, (c) => ({
      type: 'perSet' as const,
      targets: c.targets.map((t) => ({ min: t.min, max: t.max })),
    }))
    .exhaustive();
}

export function repsConfigEquals(a: RepsConfig, b: RepsConfig): boolean {
  return match([a, b] as const)
    .with([{ type: 'fixed' }, { type: 'fixed' }], ([x, y]) => x.reps === y.reps)
    .with([{ type: 'range' }, { type: 'range' }], ([x, y]) => x.min === y.min && x.max === y.max)
    .with([{ type: 'perSet' }, { type: 'perSet' }], ([x, y]) => {
      return (
        x.targets.length === y.targets.length &&
        x.targets.every((t, i) => t.min === y.targets[i]!.min && t.max === y.targets[i]!.max)
      );
    })
    .otherwise(() => false);
}

function repsConfigKey(config: RepsConfig): string {
  return match(config)
    .with({ type: 'fixed' }, (c) => `${c.reps}`)
    .with({ type: 'range' }, (c) => `${c.min}-${c.max}`)
    .with({ type: 'perSet' }, (c) => c.targets.map(formatRepsTarget).join(','))
    .exhaustive();
}

function resizeRepsTargets(targets: RepsTarget[], length: number): RepsTarget[] {
  if (targets.length >= length) {
    return targets.slice(0, length);
  }
  const last = targets.at(-1) ?? { min: 10, max: 10 };
  return [...targets, ...Array.from({ length: length - targets.length }, () => ({ ...last }))];
}

export class WeightedExerciseBlueprint {
  readonly type = 'WeightedExerciseBlueprint';

  constructor(
    readonly name: string,
    readonly sets: number,
    readonly repsConfig: RepsConfig,
    readonly progressiveOverload: ProgressiveOverload,
    readonly restBetweenSets: Rest,
    readonly supersetWithNext: boolean,
    readonly notes: string,
    readonly link: string,
    readonly trackPower: boolean = false,
  ) {}

  static empty() {
    return new WeightedExerciseBlueprint(
      '',
      3,
      { type: 'fixed', reps: 10 },
      new NoProgressiveOverload(),
      Rest.medium,
      false,
      '',
      '',
      false,
    );
  }

  static fromJSON(json: WeightedExerciseBlueprintJSON): WeightedExerciseBlueprint {
    return new WeightedExerciseBlueprint(
      json.name,
      json.sets,
      cloneRepsConfig(json.repsConfig),
      fromProgressiveOverloadJSON(json.progressiveOverload),
      Rest.fromJSON(json.restBetweenSets),
      json.supersetWithNext,
      json.notes,
      json.link,
      json.trackPower ?? false,
    );
  }

  repsTargetForSet(index: number): RepsTarget {
    return match(this.repsConfig)
      .with({ type: 'fixed' }, (c) => ({ min: c.reps, max: c.reps }))
      .with({ type: 'range' }, (c) => ({ min: c.min, max: c.max }))
      .with({ type: 'perSet' }, (c) => c.targets[index] ?? c.targets.at(-1) ?? { min: 0, max: 0 })
      .exhaustive();
  }

  withSets(value: number): WeightedExerciseBlueprint {
    const sets = Math.max(value, 1);
    return this.with({
      sets,
      repsConfig:
        this.repsConfig.type === 'perSet'
          ? { type: 'perSet', targets: resizeRepsTargets(this.repsConfig.targets, sets) }
          : this.repsConfig,
    });
  }

  withRepsConfigType(type: RepsType): WeightedExerciseBlueprint {
    const target = this.repsTargetForSet(0);
    const repsConfig = match(type)
      .returnType<RepsConfig>()
      .with('fixed', () => ({ type: 'fixed', reps: target.min }))
      .with('range', () => ({ type: 'range', min: target.min, max: target.max }))
      .with('perSet', () => ({
        type: 'perSet',
        targets: Array.from({ length: this.sets }, () => ({ min: target.max, max: target.max })),
      }))
      .exhaustive();
    return this.with({ repsConfig });
  }

  equals(other: ExerciseBlueprint | undefined) {
    if (!other) {
      return false;
    }
    if (other === this) {
      return true;
    }
    if ('type' in other && other.type !== this.type) {
      return false;
    }

    return (
      this.name === other.name &&
      this.sets === other.sets &&
      repsConfigEquals(this.repsConfig, other.repsConfig) &&
      this.progressiveOverload.equals(other.progressiveOverload) &&
      this.restBetweenSets.minRest.equals(other.restBetweenSets.minRest) &&
      this.restBetweenSets.maxRest.equals(other.restBetweenSets.maxRest) &&
      this.restBetweenSets.failureRest.equals(other.restBetweenSets.failureRest) &&
      this.supersetWithNext === other.supersetWithNext &&
      this.notes === other.notes &&
      this.link === other.link &&
      this.trackPower === other.trackPower
    );
  }

  toJSON(): WeightedExerciseBlueprintJSON {
    return {
      type: 'WeightedExerciseBlueprint',
      name: this.name,
      sets: this.sets,
      repsConfig: cloneRepsConfig(this.repsConfig),
      progressiveOverload: this.progressiveOverload.toJSON(),
      restBetweenSets: Rest.toJSON(this.restBetweenSets),
      supersetWithNext: this.supersetWithNext,
      notes: this.notes,
      link: this.link,
      trackPower: this.trackPower,
    };
  }

  with(other: Partial<WeightedExerciseBlueprint>): WeightedExerciseBlueprint {
    return new WeightedExerciseBlueprint(
      other.name ?? this.name,
      other.sets ?? this.sets,
      other.repsConfig ?? this.repsConfig,
      other.progressiveOverload ?? this.progressiveOverload,
      other.restBetweenSets ?? this.restBetweenSets,
      other.supersetWithNext ?? this.supersetWithNext,
      other.notes ?? this.notes,
      other.link ?? this.link,
      other.trackPower ?? this.trackPower,
    );
  }
}

export class KeyedExerciseBlueprint {
  private constructor(
    readonly name: string,
    private readonly differentiator: string,
  ) {}

  static fromExerciseBlueprint(e: ExerciseBlueprint): KeyedExerciseBlueprint {
    return new KeyedExerciseBlueprint(
      e.name,
      match(e)
        .with(P.instanceOf(WeightedExerciseBlueprint), (ex) => `${ex.sets}_${repsConfigKey(ex.repsConfig)}`)
        .with(P.instanceOf(CardioExerciseBlueprint), (t) => t.sets[0]?.target.type ?? 'distance')
        .exhaustive(),
    );
  }

  toString() {
    return `${this.name}_${this.differentiator}`;
  }
}

export type NormalizedNameKey = string;

export class NormalizedName {
  constructor(readonly name: string) {}
  static fromExerciseBlueprint(e: ExerciseBlueprint): NormalizedName {
    return new NormalizedName(e.name);
  }

  toString(): NormalizedNameKey {
    return NormalizedName.normalizeName(this.name);
  }

  equals(other: NormalizedName) {
    return other.toString() === this.toString();
  }

  private static normalizeName(name?: string): string {
    if (!name) {
      return '';
    }
    const lowerName = name.toLowerCase().trim().replace(/flies/g, 'flys').replace(/flyes/g, 'flys');
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

  fromJSON(json: RestJSON): Rest {
    return {
      minRest: fromDurationJSON(json.minRest),
      maxRest: fromDurationJSON(json.maxRest),
      failureRest: fromDurationJSON(json.failureRest),
    };
  },

  toJSON(value: Rest): RestJSON {
    return {
      minRest: toDurationJSON(value.minRest),
      maxRest: toDurationJSON(value.maxRest),
      failureRest: toDurationJSON(value.failureRest),
    };
  },
} as const;
export const EmptyExerciseBlueprint = new WeightedExerciseBlueprint(
  '',
  3,
  { type: 'fixed', reps: 10 },
  new NoProgressiveOverload(),
  Rest.medium,
  false,
  '',
  '',
);

export function restEquals(a: Rest | undefined, b: Rest | undefined): boolean {
  if (!a || !b) return a === b;
  return a.minRest.equals(b.minRest) && a.maxRest.equals(b.maxRest) && a.failureRest.equals(b.failureRest);
}

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

function fromCardioTargetJSON(json: CardioTargetJSON): CardioTarget {
  return match(json)
    .returnType<CardioTarget>()
    .with({ type: 'distance' }, (j) => ({
      type: 'distance',
      value: fromDistanceJSON(j.value),
    }))
    .with({ type: 'time' }, (j) => ({
      type: 'time',
      value: fromDurationJSON(j.value),
    }))
    .exhaustive();
}
function toCardioTargetJSON(value: CardioTarget): CardioTargetJSON {
  return match(value)
    .returnType<CardioTargetJSON>()
    .with({ type: 'distance' }, (j) => ({
      type: 'distance',
      value: toDistanceJSON(j.value),
    }))
    .with({ type: 'time' }, (j) => ({
      type: 'time',
      value: toDurationJSON(j.value),
    }))
    .exhaustive();
}

export function fromDistanceJSON(json: DistanceJSON): Distance {
  return {
    value: fromBigNumberJSON(json.value),
    unit: json.unit,
  };
}

export function toDistanceJSON(value: Distance): DistanceJSON {
  return {
    value: toBigNumberJSON(value.value),
    unit: value.unit,
  };
}

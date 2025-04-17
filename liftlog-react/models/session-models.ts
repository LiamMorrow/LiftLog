import {
  ExerciseBlueprint,
  ExerciseBlueprintPOJO,
  SessionBlueprint,
  SessionBlueprintPOJO,
} from '@/models/blueprint-models';
import { LocalDateTimeComparer } from '@/models/comparers';
import { indexed } from '@/utils/enumerable';
import { LocalDate, LocalDateTime, ZoneOffset } from '@js-joda/core';
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

  static fromPOJO(pojo: undefined): undefined;
  static fromPOJO(pojo: Omit<SessionPOJO, '_BRAND'>): Session;
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
      'id' in other ? other.id! : this.id,
      'blueprint' in other ? other.blueprint! : this.blueprint,
      'recordedExercises' in other
        ? other.recordedExercises!
        : this.recordedExercises,
      'date' in other ? other.date! : this.date,
      'bodyweight' in other ? other.bodyweight! : this.bodyweight,
    );
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
    return this.blueprint.name === 'Freeform Session';
  }
}

export interface RecordedExercisePOJO {
  _BRAND: 'RECORDED_EXERCISE_POJO';
  blueprint: ExerciseBlueprintPOJO;
  potentialSets: readonly PotentialSetPOJO[];
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
    notes?: string | undefined,
    perSetWeight?: boolean,
  ) {
    this.blueprint = blueprint!;
    this.potentialSets = potentialSets!;
    this.notes = notes!;
    this.perSetWeight = perSetWeight!;
  }

  static fromPOJO(
    fromPOJO: Omit<RecordedExercisePOJO, '_BRAND'>,
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
        return (
          set.weight.isEqualTo(otherSet.weight) &&
          set.set?.repsCompleted === otherSet.set?.repsCompleted &&
          set.set?.completionDateTime?.equals(otherSet.set?.completionDateTime)
        );
      })
    );
  }

  with(other: Partial<RecordedExercisePOJO>) {
    return new RecordedExercise(
      'blueprint' in other
        ? ExerciseBlueprint.fromPOJO(other.blueprint!)
        : this.blueprint,
      'potentialSets' in other
        ? other.potentialSets!.map((x) => PotentialSet.fromPOJO(x))
        : this.potentialSets,
      'notes' in other ? other.notes! : this.notes,
      'perSetWeight' in other ? other.perSetWeight! : this.perSetWeight,
    );
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
    return this.potentialSets.reduce((max, set) => {
      return set.weight.isGreaterThan(max) ? set.weight : max;
    }, new BigNumber(0));
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

  static fromPOJO(pojo: Omit<RecordedSetPOJO, '_BRAND'>): RecordedSet {
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
      'repsCompleted' in other ? other.repsCompleted! : this.repsCompleted,
      'completionDateTime' in other
        ? other.completionDateTime!
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
  constructor(set?: RecordedSet | undefined, weight?: BigNumber) {
    this.set = set;
    this.weight = weight!;
  }

  static fromPOJO(pojo: Omit<PotentialSetPOJO, '_BRAND'>): PotentialSet {
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
      'weight' in other ? other.weight! : this.weight,
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

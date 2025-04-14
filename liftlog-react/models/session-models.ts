import { ExerciseBlueprint, SessionBlueprint } from '@/models/blueprint-models';
import { LocalDateTimeComparer } from '@/models/comparers';
import { indexed } from '@/utils/enumerable';
import { LocalDate, LocalDateTime, ZoneOffset } from '@js-joda/core';
import BigNumber from 'bignumber.js';
import Enumerable from 'linq';
import { match, P } from 'ts-pattern';

export interface SessionPOJO {
  _BRAND: 'SESSION_POJO';
  id: string;
  blueprint: SessionBlueprint;
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
  static fromPOJO(pojo: SessionPOJO): Session;
  static fromPOJO(pojo: SessionPOJO | undefined): Session | undefined;
  static fromPOJO(pojo: SessionPOJO | undefined): Session | undefined {
    return (
      pojo &&
      new Session(
        pojo.id,
        pojo.blueprint,
        pojo.recordedExercises.map(RecordedExercise.fromPOJO),
        pojo.date,
        pojo.bodyweight,
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
      blueprint: this.blueprint,
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
  blueprint: ExerciseBlueprint;
  potentialSets: readonly PotentialSet[];
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

  with(other: Partial<RecordedExercisePOJO>) {
    return new RecordedExercise(
      'blueprint' in other ? other.blueprint! : this.blueprint,
      'potentialSets' in other ? other.potentialSets! : this.potentialSets,
      'notes' in other ? other.notes! : this.notes,
      'perSetWeight' in other ? other.perSetWeight! : this.perSetWeight,
    );
  }

  static fromPOJO(fromPOJO: RecordedExercisePOJO): RecordedExercise {
    return new RecordedExercise(
      fromPOJO.blueprint,
      fromPOJO.potentialSets,
      fromPOJO.notes,
      fromPOJO.perSetWeight,
    );
  }

  toPOJO(): RecordedExercisePOJO {
    return {
      _BRAND: 'RECORDED_EXERCISE_POJO',
      blueprint: this.blueprint,
      perSetWeight: this.perSetWeight,
      potentialSets: this.potentialSets,
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

export interface RecordedSet {
  readonly repsCompleted: number;
  readonly completionDateTime: LocalDateTime;
}

export interface PotentialSet {
  readonly set: RecordedSet | undefined;
  readonly weight: BigNumber;
}

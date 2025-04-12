import { ExerciseBlueprint, SessionBlueprint } from '@/models/blueprint-models';
import { LocalDateTimeComparer } from '@/models/comparers';
import { indexed } from '@/utils/enumerable';
import { LocalDate, LocalDateTime, ZoneOffset } from '@js-joda/core';
import BigNumber from 'bignumber.js';
import Enumerable from 'linq';
import { match, P } from 'ts-pattern';

export interface Session {
  readonly id: string;
  readonly blueprint: SessionBlueprint;
  readonly recordedExercises: readonly RecordedExercise[];
  readonly date: LocalDate;
  readonly bodyweight: BigNumber | undefined;
}

export const Session = {
  isStarted(session: Session): boolean {
    return session.recordedExercises.some(
      (x) => RecordedExercise.lastRecordedSet(x) !== undefined,
    );
  },

  nextExercise(session: Session): RecordedExercise | undefined {
    const recordedExercises = session.recordedExercises;
    const latestExerciseIndex = Enumerable.from(recordedExercises)
      .select(indexed)
      .where((x) => !!RecordedExercise.lastRecordedSet(x.item))
      .orderByDescending(
        ({ item }) =>
          RecordedExercise.lastRecordedSet(item)!.set?.completionDateTime,
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
      RecordedExercise.hasRemainingSets(
        recordedExercises[latestExerciseIndex + 1],
      )
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
        !RecordedExercise.hasRemainingSets(recordedExercises[indexToJumpBackTo])
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
      if (RecordedExercise.hasRemainingSets(recordedExercise)) {
        const lastRecordedSet =
          RecordedExercise.lastRecordedSet(recordedExercise);
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
  },

  lastExercise(session: Session): RecordedExercise | undefined {
    return Enumerable.from(session.recordedExercises)
      .where((x) => x.potentialSets.some((set) => set.set))
      .defaultIfEmpty(undefined)
      .maxBy((x) =>
        RecordedExercise.lastRecordedSet(x)
          ?.set?.completionDateTime.toInstant(ZoneOffset.UTC)
          .toEpochMilli(),
      );
  },
};

export interface RecordedExercise {
  readonly blueprint: ExerciseBlueprint;
  readonly potentialSets: readonly PotentialSet[];
  readonly notes: string | undefined;
  readonly perSetWeight: boolean;
}

export const RecordedExercise = {
  maxWeight(recordedExercise: RecordedExercise): BigNumber {
    return recordedExercise.potentialSets.reduce((max, set) => {
      return set.weight.isGreaterThan(max) ? set.weight : max;
    }, new BigNumber(0));
  },

  lastRecordedSet(
    recordedExercise: RecordedExercise | undefined,
  ): PotentialSet | undefined {
    if (!recordedExercise) {
      return undefined;
    }
    const result = Enumerable.from(recordedExercise.potentialSets)
      .orderByDescending(
        (x) => x.set?.completionDateTime,
        LocalDateTimeComparer,
      )
      .firstOrDefault((x) => x.set !== undefined);
    return result;
  },

  hasRemainingSets(recordedExercise: RecordedExercise): boolean {
    return recordedExercise.potentialSets.some((x) => x.set === undefined);
  },
};

export interface RecordedSet {
  readonly repsCompleted: number;
  readonly completionDateTime: LocalDateTime;
}

export interface PotentialSet {
  readonly set: RecordedSet | undefined;
  readonly weight: BigNumber;
}

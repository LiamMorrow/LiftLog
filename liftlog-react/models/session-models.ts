import { ExerciseBlueprint, SessionBlueprint } from '@/models/blueprint-models';
import { LocalTimeComparer } from '@/models/comparers';
import { LocalDate, LocalTime } from '@js-joda/core';
import BigNumber from 'bignumber.js';
import Enumerable from 'linq';

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
    const latestExerciseIndex = Enumerable.from(session.recordedExercises)
      .select((x, index) => ({ item: x, index }))
      .where((x) => RecordedExercise.lastRecordedSet(x.item) !== undefined)
      .orderByDescending(
        (x) => x.item.potentialSets.find((set) => set.set)?.set?.completionTime,
        LocalTimeComparer,
      )
      .select((x) => x.index)
      .firstOrDefault(-1);

    const latestExerciseSupersetsWithNext =
      latestExerciseIndex === -1
        ? false
        : latestExerciseIndex === session.recordedExercises.length - 1
          ? false
          : session.recordedExercises[latestExerciseIndex].blueprint
              .supersetWithNext;

    const latestExerciseSupersetsWithPrevious =
      latestExerciseIndex === -1 || latestExerciseIndex === 0
        ? false
        : session.recordedExercises[latestExerciseIndex - 1].blueprint
            .supersetWithNext;

    if (
      latestExerciseSupersetsWithNext &&
      RecordedExercise.hasRemainingSets(
        session.recordedExercises[latestExerciseIndex + 1],
      )
    ) {
      return session.recordedExercises[latestExerciseIndex + 1];
    }

    if (latestExerciseSupersetsWithPrevious) {
      let indexToJumpBackTo = latestExerciseIndex - 1;
      while (
        indexToJumpBackTo >= 0 &&
        session.recordedExercises[indexToJumpBackTo].blueprint.supersetWithNext
      ) {
        indexToJumpBackTo--;
      }
      indexToJumpBackTo++;
      while (
        indexToJumpBackTo < session.recordedExercises.length &&
        !RecordedExercise.hasRemainingSets(
          session.recordedExercises[indexToJumpBackTo],
        )
      ) {
        indexToJumpBackTo++;
      }

      if (indexToJumpBackTo < session.recordedExercises.length) {
        return session.recordedExercises[indexToJumpBackTo];
      }
    }

    return Enumerable.from(session.recordedExercises)
      .where((x) => RecordedExercise.hasRemainingSets(x))
      .orderByDescending(
        (x) => x.potentialSets.find((set) => set.set)?.set?.completionTime,
        LocalTimeComparer,
      )
      .firstOrDefault();
  },

  lastExercise(session: Session): RecordedExercise | undefined {
    return Enumerable.from(session.recordedExercises)
      .where((x) => x.potentialSets.some((set) => set.set))
      .defaultIfEmpty(undefined)
      .maxBy((x) =>
        RecordedExercise.lastRecordedSet(x)?.set?.completionTime.toNanoOfDay(),
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
    return Enumerable.from(recordedExercise.potentialSets)
      .orderByDescending((x) => x.set?.completionTime, LocalTimeComparer)
      .firstOrDefault((x) => x.set !== undefined);
  },

  hasRemainingSets(recordedExercise: RecordedExercise): boolean {
    return recordedExercise.potentialSets.some((x) => x.set === undefined);
  },
};

export interface RecordedSet {
  readonly repsCompleted: number;
  readonly completionTime: LocalTime;
}

export interface PotentialSet {
  readonly set: RecordedSet | undefined;
  readonly weight: BigNumber;
}

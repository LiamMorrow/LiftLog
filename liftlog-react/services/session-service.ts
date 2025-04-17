import {
  ExerciseBlueprint,
  KeyedExerciseBlueprint,
  SessionBlueprint,
} from '@/models/blueprint-models';
import {
  PotentialSet,
  RecordedExercise,
  Session,
} from '@/models/session-models';
import { ProgressRepository } from '@/services/progress-repository';
import type { RootState } from '@/store';
import { uuid } from '@/utils/uuid';
import { LocalDate } from '@js-joda/core';
import BigNumber from 'bignumber.js';
import Enumerable from 'linq';
import { match, P } from 'ts-pattern';

export class SessionService {
  constructor(
    private progressRepository: ProgressRepository,
    private getState: () => RootState,
  ) {}

  async *getUpcomingSessions(
    sessionBlueprints: SessionBlueprint[],
  ): AsyncIterableIterator<Session> {
    const currentState = this.getState();
    const currentSession = Session.fromPOJO(
      currentState.currentSession.workoutSession,
    );
    if (currentSession?.isStarted) {
      yield currentSession;
    }

    if (!sessionBlueprints.length) {
      return;
    }
    // TODO: does not match original impl

    const latestRecordedExercises =
      await this.progressRepository.getLatestRecordedExercises();
    let latestSession = await match(currentSession)
      .with({ isStarted: true }, (x) => x)
      .otherwise(async () =>
        (await this.progressRepository.getOrderedSessions()).firstOrDefault(
          (x) => !x.isFreeform,
        ),
      );
    if (!latestSession) {
      latestSession = this.createNewSession(
        sessionBlueprints[0],
        latestRecordedExercises,
      );
      yield latestSession;
    }

    while (true) {
      latestSession = this.getNextSession(
        latestSession,
        sessionBlueprints,
        latestRecordedExercises,
      );
      yield latestSession;
    }
  }

  private getNextSession(
    previousSession: Session,
    sessionBlueprints: SessionBlueprint[],
    latestRecordedExercises: Enumerable.IDictionary<
      KeyedExerciseBlueprint,
      RecordedExercise
    >,
  ): Session {
    const lastBlueprint = previousSession.blueprint;
    const lastBlueprintIndex = sessionBlueprints.findIndex(
      (x) => x.name === lastBlueprint.name,
    );
    const nextBlueprint =
      sessionBlueprints[(lastBlueprintIndex + 1) % sessionBlueprints.length];

    return this.createNewSession(nextBlueprint, latestRecordedExercises).with({
      bodyweight: previousSession.bodyweight,
    });
  }

  private createNewSession(
    sessionBlueprint: SessionBlueprint,
    latestRecordedExercises: Enumerable.IDictionary<
      KeyedExerciseBlueprint,
      RecordedExercise
    >,
  ): Session {
    const {
      settings: { splitWeightByDefault },
    } = this.getState();
    function getNextExercise(e: ExerciseBlueprint): RecordedExercise {
      const lastExercise = latestRecordedExercises.get(e);
      const potentialSets: PotentialSet[] = match(lastExercise)
        .returnType<PotentialSet[]>()
        .with(
          P.union(undefined, {
            perSetWeight: false,
            isSuccessForProgressiveOverload: false,
          }),
          () =>
            Array.from({ length: e.sets }, () =>
              PotentialSet.fromPOJO({
                weight: lastExercise?.potentialSets[0]?.weight ?? BigNumber(0),
                set: undefined,
              }),
            ),
        )
        .with({ isSuccessForProgressiveOverload: true }, (x) =>
          x.potentialSets.map((x) =>
            PotentialSet.fromPOJO({
              weight: x.weight.plus(e.weightIncreaseOnSuccess),
              set: undefined,
            }),
          ),
        )
        .otherwise((x) =>
          x.potentialSets.map((x) =>
            PotentialSet.fromPOJO({
              weight: x.weight,
              set: undefined,
            }),
          ),
        );

      return new RecordedExercise(
        e,
        potentialSets,
        undefined,
        splitWeightByDefault || (lastExercise?.perSetWeight ?? false),
      );
    }
    return new Session(
      uuid(),
      sessionBlueprint,
      sessionBlueprint.exercises.map(getNextExercise),
      LocalDate.now(),
      undefined,
    );
  }
}

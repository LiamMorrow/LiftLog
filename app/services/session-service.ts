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
import { match } from 'ts-pattern';

export class SessionService {
  constructor(
    private progressRepository: ProgressRepository,
    private getState: () => RootState,
  ) {}

  // TODO this is super inefficient, it should probably be done ahead of time or with a dirty mark.
  async *getUpcomingSessions(
    sessionBlueprints: SessionBlueprint[],
  ): AsyncIterableIterator<Session> {
    const currentState = this.getState();
    const currentSession = Session.fromPOJO(
      currentState.currentSession.workoutSession,
    );

    if (!sessionBlueprints.length) {
      return;
    }
    await yieldToEventLoop();

    const latestRecordedExercises =
      this.progressRepository.getLatestRecordedExercises();
    await yieldToEventLoop();
    let latestSession =
      currentSession ??
      this.progressRepository
        .getOrderedSessions()
        .firstOrDefault((x) => !x.isFreeform);

    await yieldToEventLoop();
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

  public hydrateSessionFromBlueprint(blueprint: SessionBlueprint): Session {
    const latestRecordedExercises =
      this.progressRepository.getLatestRecordedExercises();
    return this.createNewSession(blueprint, latestRecordedExercises);
  }

  private getNextSession(
    previousSession: Session,
    sessionBlueprints: SessionBlueprint[],
    latestRecordedExercises: Enumerable.IDictionary<
      string, //KeyedExerciseBlueprint,
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
      string, //KeyedExerciseBlueprint,
      RecordedExercise
    >,
  ): Session {
    function getNextExercise(e: ExerciseBlueprint): RecordedExercise {
      const lastExercise = latestRecordedExercises.get(
        KeyedExerciseBlueprint.fromExerciseBlueprint(e).toString(),
      );
      const potentialSets: PotentialSet[] = match(lastExercise)
        .returnType<PotentialSet[]>()
        .with(undefined, () =>
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

      return new RecordedExercise(e, potentialSets, undefined);
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

// Helper function to yield control back to the event loop
const yieldToEventLoop = () => new Promise((resolve) => setTimeout(resolve, 5));

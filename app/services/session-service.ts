import {
  KeyedExerciseBlueprint,
  SessionBlueprint,
  ExerciseBlueprint,
  CardioExerciseBlueprint,
} from '@/models/blueprint-models';
import { Weight, WeightUnit } from '@/models/weight';
import {
  PotentialSet,
  RecordedCardioExercise,
  RecordedCardioExerciseSet,
  RecordedExercise,
  RecordedWeightedExercise,
  Session,
} from '@/models/session-models';
import { ProgressRepository } from '@/services/progress-repository';
import type { RootState } from '@/store';
import { uuid } from '@/utils/uuid';
import { LocalDate } from '@js-joda/core';
import { match } from 'ts-pattern';

export class SessionService {
  constructor(
    private progressRepository: ProgressRepository,
    private getState: () => RootState,
  ) {}

  async *getUpcomingSessions(
    sessionBlueprints: SessionBlueprint[],
    latestExercises: Record<string, RecordedExercise | undefined>, // KeyedExerciseBlueprint -> Exercise
  ): AsyncIterableIterator<Session> {
    const currentState = this.getState();
    const currentSession = Session.fromPOJO(
      currentState.currentSession.workoutSession,
    );

    if (!sessionBlueprints.length) {
      return;
    }
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
        latestExercises,
      );
      yield latestSession;
    }

    while (true) {
      latestSession = this.getNextSession(
        latestSession,
        sessionBlueprints,
        latestExercises,
      );
      yield latestSession;
    }
  }

  public hydrateSessionFromBlueprint(
    blueprint: SessionBlueprint,
    latestExercises: Record<string, RecordedExercise | undefined>, // KeyedExerciseBlueprint -> Exercise
  ): Session {
    return this.createNewSession(blueprint, latestExercises);
  }

  private getNextSession(
    previousSession: Session,
    sessionBlueprints: SessionBlueprint[],
    latestRecordedExercises: Record<
      string, //KeyedExerciseBlueprint,
      RecordedExercise | undefined
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
    latestRecordedExercises: Record<
      string, //KeyedExerciseBlueprint,
      RecordedExercise | undefined
    >,
  ): Session {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const $this = this;
    function getNextExercise(e: ExerciseBlueprint): RecordedExercise {
      const lastExercise =
        latestRecordedExercises[
          KeyedExerciseBlueprint.fromExerciseBlueprint(e).toString()
        ];
      if (e instanceof CardioExerciseBlueprint) {
        const cardioLastExercise =
          lastExercise instanceof RecordedCardioExercise
            ? lastExercise
            : undefined;
        return RecordedCardioExercise.empty(e).with({
          sets: e.sets.map((s, i) =>
            RecordedCardioExerciseSet.empty(s).with({
              incline: cardioLastExercise?.sets[i]?.incline,
              resistance: cardioLastExercise?.sets[i]?.resistance,
            }),
          ),
        });
      }
      const weightedLastExercise =
        lastExercise instanceof RecordedWeightedExercise
          ? lastExercise
          : undefined;
      const potentialSets: PotentialSet[] = match(weightedLastExercise)
        .returnType<PotentialSet[]>()
        .with(undefined, () =>
          Array.from({ length: e.sets }, () =>
            PotentialSet.fromPOJO({
              weight:
                weightedLastExercise?.potentialSets[0]?.weight ??
                new Weight(0, $this.getDefaultWeightUnit()),
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

      return new RecordedWeightedExercise(e, potentialSets, undefined);
    }
    return new Session(
      uuid(),
      sessionBlueprint,
      sessionBlueprint.exercises.map(getNextExercise),
      LocalDate.now(),
      undefined,
    );
  }

  private getDefaultWeightUnit(): WeightUnit {
    return this.getState().settings.useImperialUnits ? 'pounds' : 'kilograms';
  }
}

// Helper function to yield control back to the event loop
const yieldToEventLoop = () => new Promise((resolve) => setTimeout(resolve, 5));

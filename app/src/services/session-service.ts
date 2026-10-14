import {
  ProgressionKey,
  SessionBlueprint,
  ExerciseBlueprint,
  CardioExerciseBlueprint,
  applyProgression,
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
import { readLatestExercises, readSessionToContinueFrom } from '@/db/sessions';
import type { RootState } from '@/store';
import { uuid } from '@/utils/uuid';
import { LocalDate } from '@js-joda/core';
import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { match } from 'ts-pattern';

export class SessionService {
  constructor(
    private db: ExpoSQLiteDatabase,
    private getState: () => RootState,
  ) {}

  async *getUpcomingSessions(sessionBlueprints: SessionBlueprint[]): AsyncIterableIterator<Session> {
    if (!sessionBlueprints.length) {
      return;
    }

    const latestExercises = readLatestExercises(
      this.db,
      sessionBlueprints.flatMap((session) => session.exercises.map((exercise) => exercise.progressionKey())),
    );
    const previousSession = readSessionToContinueFrom(this.db);

    // Track the plan position by index so progression walks the plan in order.
    // Matching only by name would stall on duplicate-named workouts, always
    // resolving to the first one and never advancing past it.
    let index = previousSession ? sessionBlueprints.findIndex((x) => x.name === previousSession.name) : -1;

    while (true) {
      index = (index + 1) % sessionBlueprints.length;
      yield this.createNewSession(sessionBlueprints[index]!, latestExercises).with({
        bodyweight: previousSession?.bodyweight,
      });
    }
  }

  private createNewSession(
    sessionBlueprint: SessionBlueprint,
    latestRecordedExercises: Record<ProgressionKey, RecordedExercise | undefined>,
  ): Session {
    // oxlint-disable-next-line typescript/no-this-alias
    const $this = this;
    function getNextExercise(e: ExerciseBlueprint): RecordedExercise {
      const lastExercise = latestRecordedExercises[e.progressionKey()];
      if (e instanceof CardioExerciseBlueprint) {
        const cardioLastExercise = lastExercise instanceof RecordedCardioExercise ? lastExercise : undefined;
        return RecordedCardioExercise.empty(e).with({
          sets: e.sets.map((s, i) =>
            RecordedCardioExerciseSet.empty(s).with({
              incline: cardioLastExercise?.sets[i]?.incline,
              resistance: cardioLastExercise?.sets[i]?.resistance,
            }),
          ),
        });
      }
      const weightedLastExercise = lastExercise instanceof RecordedWeightedExercise ? lastExercise : undefined;
      const potentialSets: PotentialSet[] = match(weightedLastExercise)
        .returnType<PotentialSet[]>()
        .with(undefined, () =>
          e.plannedSets.map((s) => new PotentialSet(undefined, new Weight(0, $this.getDefaultWeightUnit()), s.reps)),
        )
        // Where reps are what advances, the target carries forward alongside the weight so the
        // lineage keeps what a rule won for it. Where they are a fixed prescription it is re-seeded
        // from the plan, because the only thing that could have changed it is an edit to the plan -
        // and that edit already had its own say in the save-changes dialog.
        .otherwise((x) =>
          x.potentialSets.map(
            (ps, index) =>
              new PotentialSet(undefined, ps.weight, e.repsAreProgressed ? ps.target : e.repsTargetForSet(index)),
          ),
        );
      const newExercise = new RecordedWeightedExercise(e, potentialSets, undefined);
      return weightedLastExercise?.isSuccessForProgressiveOverload
        ? applyProgression(e.progression, newExercise)
        : newExercise;
    }
    return new Session(
      uuid(),
      sessionBlueprint,
      sessionBlueprint.exercises.map(getNextExercise),
      LocalDate.now(),
      undefined,
      undefined,
    );
  }

  private getDefaultWeightUnit(): WeightUnit {
    return this.getState().settings.useImperialUnits ? 'pounds' : 'kilograms';
  }
}

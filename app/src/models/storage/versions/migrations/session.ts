import { createMigrations } from '@/models/storage/versions/migrations/migrator';
import { addProgressiveOverloadToExercise } from '@/models/storage/versions/migrations/steps/add-progressive-overload';
import { repsPerSetToRepsConfig } from '@/models/storage/versions/migrations/steps/reps-per-set-to-reps-config';
import { addUsesBodyweight } from '@/models/storage/versions/migrations/steps/add-uses-bodyweight';
import { repsConfigToPlannedSets } from '@/models/storage/versions/migrations/steps/reps-config-to-planned-sets';
import { addSetTargets } from '@/models/storage/versions/migrations/steps/add-set-targets';
import { progressiveOverloadToRules } from '@/models/storage/versions/migrations/steps/progressive-overload-to-rules';
import { SessionJSON as InitialSessionJSON } from '@/models/storage/versions/initial';
import { SessionJSON } from '@/models/storage/versions/latest/session';
import { omit } from '@/utils/omit';

export const sessionMigrations = createMigrations<InitialSessionJSON>()
  .add((session) => ({
    ...session,
    version: 2,
    blueprint: omit('exercises', session.blueprint), // Don't need to store it twice
    recordedExercises: session.recordedExercises.map((ex) =>
      ex.type === 'RecordedCardioExercise'
        ? ex
        : {
            ...ex,
            blueprint: addProgressiveOverloadToExercise(ex.blueprint),
          },
    ),
  }))
  .add((session) => ({
    ...session,
    version: 3,
    recordedExercises: session.recordedExercises.map((ex) =>
      ex.type === 'RecordedCardioExercise'
        ? ex
        : {
            ...ex,
            blueprint: repsPerSetToRepsConfig(ex.blueprint),
          },
    ),
  }))
  .add((session) => ({
    ...session,
    version: 4,
    recordedExercises: session.recordedExercises.map((ex) =>
      ex.type === 'RecordedCardioExercise'
        ? ex
        : {
            ...ex,
            blueprint: addUsesBodyweight(ex.blueprint),
          },
    ),
  }))
  .add((session) => ({
    ...session,
    version: 5,
    recordedExercises: session.recordedExercises.map((ex) =>
      ex.type === 'RecordedCardioExercise'
        ? ex
        : {
            ...ex,
            blueprint: repsConfigToPlannedSets(ex.blueprint),
          },
    ),
  }))
  .add((session) => ({
    ...session,
    version: 6,
    recordedExercises: session.recordedExercises.map((ex) =>
      ex.type === 'RecordedCardioExercise' ? ex : addSetTargets(ex),
    ),
  }))
  .add((session) => ({
    ...session,
    version: 7,
    recordedExercises: session.recordedExercises.map((ex) =>
      ex.type === 'RecordedCardioExercise'
        ? ex
        : {
            ...ex,
            blueprint: progressiveOverloadToRules(ex.blueprint),
          },
    ),
  }))
  .build<SessionJSON>();

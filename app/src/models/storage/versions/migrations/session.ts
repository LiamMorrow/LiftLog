import { createMigrations } from '@/models/storage/versions/migrations/migrator';
import { addProgressiveOverloadToExercise } from '@/models/storage/versions/migrations/steps/add-progressive-overload';
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
  .build<SessionJSON>();

import { exercisesSchema } from '@/db/schema';
import { readSessions, readStartedSessionVolumes, writeSession } from '@/db/sessions';
import { RecordedWeightedExercise } from '@/models/session-models';
import {
  makeCardioBlueprint,
  makeRecordedExercise,
  makeSession,
  makeWeightedBlueprint,
} from '@/models/session-models/__test__/helpers';
import { Weight } from '@/models/weight';
import { importExercisesFromWorkouts } from '@/services/data-migrations/import-exercises-from-workouts';
import { migrateNilWeightUnits } from '@/services/data-migrations/migrate-nil-weight-units';
import { DatabaseMigrationService } from '@/services/database-migration-service';
import { PreferenceService } from '@/services/preference-service';
import { drizzle, type ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { openDatabaseAsync } from 'expo-sqlite';
import { describe, expect, it, vi } from 'vitest';

async function createDb(): Promise<ExpoSQLiteDatabase> {
  const db = drizzle(await openDatabaseAsync(':memory:'));
  await new DatabaseMigrationService(db, { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() } as never, {
    importOldData: async () => {},
  }).migrate();
  return db;
}

describe('MIGRATE_NIL_WEIGHT_UNITS', () => {
  it('gives nil-unit set weights the preferred unit', async () => {
    const db = await createDb();
    const squat = makeWeightedBlueprint();
    const session = makeSession([squat]).with({
      recordedExercises: [makeRecordedExercise(squat, [5, undefined], new Weight(20, 'nil'))],
    });
    db.transaction((tx) => writeSession(tx, session));

    await migrateNilWeightUnits(db, { getUseImperialUnits: async () => true } as unknown as PreferenceService);

    const exercise = readSessions(db).sessions[0]!.recordedExercises[0] as RecordedWeightedExercise;
    expect(exercise.potentialSets.map((x) => x.weight)).toEqual([new Weight(20, 'pounds'), new Weight(20, 'pounds')]);
  });

  it('summarises the sessions whose weights it changed again', async () => {
    const db = await createDb();
    const squat = makeWeightedBlueprint();
    const session = makeSession([squat]).with({
      recordedExercises: [makeRecordedExercise(squat, [5], new Weight(20, 'nil'))],
    });
    db.transaction((tx) => writeSession(tx, session));

    await migrateNilWeightUnits(db, { getUseImperialUnits: async () => true } as unknown as PreferenceService);

    expect(readStartedSessionVolumes(db)[0]?.volumeKg).toBeCloseTo((20 / 2.20462) * 5);
  });
});

describe('IMPORT_EXERCISES_FROM_WORKOUTS', () => {
  it('adds each logged movement that is not already an exercise, once', async () => {
    const db = await createDb();
    const squat = makeWeightedBlueprint({ name: 'Squat' });
    db.transaction((tx) => {
      writeSession(tx, makeSession([squat, makeCardioBlueprint()]));
      writeSession(
        tx,
        makeSession([makeWeightedBlueprint({ name: 'squat ' }), makeWeightedBlueprint({ name: 'Bench' })]),
      );
    });
    db.insert(exercisesSchema)
      .values({
        id: 'bench',
        payload: {
          name: 'Bench',
          category: '',
          equipment: null,
          force: null,
          instructions: '',
          level: '',
          mechanic: '',
          muscles: [],
        },
      })
      .run();

    await importExercisesFromWorkouts(db);

    const names = db
      .select()
      .from(exercisesSchema)
      .all()
      .map((x) => x.payload.name);
    expect(names.toSorted()).toEqual(['Bench', 'Row', 'Squat']);
  });
});

import { describe, it, expect, vi } from 'vitest';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseAsync } from 'expo-sqlite';
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { DatabaseMigrationService } from '@/services/database-migration-service';
import { dataMigrationsSchema, exercisesSchema } from '@/db/schema';
import { ExerciseDescriptor, toExerciseDescriptorJSON } from '@/models/exercise-models';
import { loadCanonicalBuiltInExercises } from '@/services/exercise-catalog';
import { exerciseDescriptorMigrations } from '@/models/storage/versions/migrations';
import {
  splitSecondaryMuscles,
  splitSecondaryMusclesDataMigration,
} from '@/services/data-migrations/split-secondary-muscles';

async function createTestDb(): Promise<ExpoSQLiteDatabase> {
  const expoDb = await openDatabaseAsync(':memory:');
  const db = drizzle(expoDb);
  const migrationService = new DatabaseMigrationService(
    db,
    { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() } as never,
    { importOldData: async () => {} },
  );
  await migrationService.migrate();
  return db;
}

function withoutSecondary(descriptor: ExerciseDescriptor): ExerciseDescriptor {
  const { secondaryMuscles: _, ...rest } = descriptor;
  return rest;
}

describe('splitSecondaryMuscles', () => {
  it('restores the split on edited built-ins whose muscles still match, and leaves the rest alone', async () => {
    const db = await createTestDb();
    const canonical = await loadCanonicalBuiltInExercises();
    const [renamed, remuscled] = Object.keys(canonical).filter((id) => canonical[id]!.secondaryMuscles?.length);

    await db.insert(exercisesSchema).values([
      {
        id: renamed!,
        payload: toExerciseDescriptorJSON({
          ...withoutSecondary(canonical[renamed!]!),
          name: 'Renamed',
          muscles: [...canonical[renamed!]!.muscles].reverse(),
        }),
      },
      {
        id: remuscled!,
        payload: toExerciseDescriptorJSON({ ...withoutSecondary(canonical[remuscled!]!), muscles: ['neck'] }),
      },
      {
        id: 'user-uuid',
        payload: toExerciseDescriptorJSON({ ...withoutSecondary(canonical[renamed!]!), name: 'Mine' }),
      },
    ]);

    await splitSecondaryMuscles(db);

    const byId = Object.fromEntries(
      (await db.select().from(exercisesSchema)).map((row) => [
        row.id,
        exerciseDescriptorMigrations.migrate(row.payload),
      ]),
    );
    expect(byId[renamed!]!.secondaryMuscles).toEqual(canonical[renamed!]!.secondaryMuscles);
    expect(byId[renamed!]!.name).toBe('Renamed');
    expect(byId[remuscled!]!.secondaryMuscles).toBeUndefined();
    expect(byId['user-uuid']!.secondaryMuscles).toBeUndefined();
    expect((await db.select().from(dataMigrationsSchema)).map((x) => x.id)).toContain(
      splitSecondaryMusclesDataMigration,
    );
  });
});

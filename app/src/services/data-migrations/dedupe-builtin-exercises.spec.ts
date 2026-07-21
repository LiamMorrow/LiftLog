import { describe, it, expect, vi } from 'vitest';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseAsync } from 'expo-sqlite';
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { DatabaseMigrationService } from '@/services/database-migration-service';
import { exercisesSchema } from '@/db/schema';
import { toExerciseDescriptorJSON } from '@/models/exercise-models';
import { loadCanonicalBuiltInExercises } from '@/services/exercise-catalog';
import { dedupeBuiltInExercises } from '@/services/data-migrations/dedupe-builtin-exercises';
import type { KeyValueStore } from '@/services/key-value-store';

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

function makeKvStore(overrides: Record<string, string | null> = {}) {
  const store = overrides;
  return {
    getItem: vi.fn().mockImplementation((key: string) => Promise.resolve(store[key] ?? null)),
    setItem: vi.fn().mockImplementation((key: string, val: string) => {
      store[key] = val;
      return Promise.resolve();
    }),
    removeItem: vi.fn().mockImplementation((key: string) => {
      delete store[key];
      return Promise.resolve();
    }),
    store,
  };
}

describe('dedupeBuiltInExercises', () => {
  it('removes un-edited built-ins, keeps overrides and user exercises, and tombstones deleted built-ins', async () => {
    const db = await createTestDb();
    const canonical = await loadCanonicalBuiltInExercises();
    const ids = Object.keys(canonical);
    const unedited = ids[0]!;
    const edited = ids[1]!;
    const deleted = ids[2]!;

    await db.insert(exercisesSchema).values([
      { id: unedited, payload: toExerciseDescriptorJSON(canonical[unedited]!) },
      { id: edited, payload: toExerciseDescriptorJSON({ ...canonical[edited]!, name: 'My custom name' }) },
      { id: 'user-uuid', payload: toExerciseDescriptorJSON({ ...canonical[unedited]!, name: 'User Exercise' }) },
    ]);

    // The user had `deleted` in the past but it's no longer in the DB, so it was deleted by them.
    const kv = makeKvStore({ AddedBuiltInExerciseIdList: JSON.stringify([unedited, edited, deleted]) });

    await dedupeBuiltInExercises(db, kv as unknown as KeyValueStore);

    const byId = (a: string, b: string) => a.localeCompare(b);
    const remainingIds = (await db.select().from(exercisesSchema)).map((r) => r.id).sort(byId);
    expect(remainingIds).toEqual([edited, 'user-uuid'].sort(byId));
    expect(JSON.parse(kv.store.HiddenBuiltInExerciseIdList as string)).toEqual([deleted]);
  });
});

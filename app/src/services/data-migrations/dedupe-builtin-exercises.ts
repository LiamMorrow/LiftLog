import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { eq } from 'drizzle-orm';
import { KeyValueStore } from '../key-value-store';
import { dataMigrationsSchema, exercisesSchema } from '@/db/schema';
import { ExerciseDescriptor } from '@/models/exercise-models';
import { exerciseDescriptorMigrations } from '@/models/storage/versions/migrations';
import { loadCanonicalBuiltInExercises } from '@/services/exercise-catalog';

export const dedupeBuiltInExercisesDataMigration = 'DEDUPE_BUILTIN_EXERCISES';

// Legacy list of every built-in that was ever imported into the DB.
const addedBuiltInExerciseIdsStorageKey = 'AddedBuiltInExerciseIdList';
const hiddenBuiltInExerciseIdsStorageKey = 'HiddenBuiltInExerciseIdList';

function descriptorsEqual(a: ExerciseDescriptor, b: ExerciseDescriptor): boolean {
  return (
    a.name === b.name &&
    a.force === b.force &&
    a.level === b.level &&
    a.mechanic === b.mechanic &&
    a.equipment === b.equipment &&
    a.category === b.category &&
    a.instructions === b.instructions &&
    a.muscles.length === b.muscles.length &&
    a.muscles.every((m, i) => m === b.muscles[i])
  );
}

/**
 * Older versions copied all built-in exercises into the DB. Built-ins are now served from the bundled
 * catalog, so remove the un-edited copies (keeping user edits as overrides) and tombstone the ones the
 * user had deleted so they don't reappear from the catalog.
 */
export async function dedupeBuiltInExercises(db: ExpoSQLiteDatabase, keyValueStore: KeyValueStore) {
  const canonical = await loadCanonicalBuiltInExercises();
  const rows = await db.select().from(exercisesSchema);
  const presentIds = new Set(rows.map((r) => r.id));

  const idsToDelete = rows
    .filter((row) => {
      const canonicalDescriptor = canonical[row.id];
      return (
        canonicalDescriptor && descriptorsEqual(exerciseDescriptorMigrations.migrate(row.payload), canonicalDescriptor)
      );
    })
    .map((row) => row.id);

  const added = JSON.parse((await keyValueStore.getItem(addedBuiltInExerciseIdsStorageKey)) ?? '[]') as string[];
  const hidden = added.filter((id) => canonical[id] && !presentIds.has(id));

  await db.transaction(async (tx) => {
    for (const id of idsToDelete) {
      await tx.delete(exercisesSchema).where(eq(exercisesSchema.id, id));
    }
    await tx.insert(dataMigrationsSchema).values({ id: dedupeBuiltInExercisesDataMigration });
  });
  await keyValueStore.setItem(hiddenBuiltInExerciseIdsStorageKey, JSON.stringify(hidden));
}

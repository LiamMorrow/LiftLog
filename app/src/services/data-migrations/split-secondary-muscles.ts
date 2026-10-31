import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { eq } from 'drizzle-orm';
import { dataMigrationsSchema, exercisesSchema } from '@/db/schema';
import { exerciseDescriptorMigrations } from '@/models/storage/versions/migrations';
import { loadCanonicalBuiltInExercises } from '@/services/exercise-catalog';

export const splitSecondaryMusclesDataMigration = 'SPLIT_SECONDARY_MUSCLES';

function sameMuscles(a: string[], b: string[]): boolean {
  const set = new Set(a);
  return set.size === new Set(b).size && b.every((muscle) => set.has(muscle));
}

export async function splitSecondaryMuscles(db: ExpoSQLiteDatabase) {
  const canonical = await loadCanonicalBuiltInExercises();
  const rows = await db.select().from(exercisesSchema);

  const updates = rows.flatMap((row) => {
    const builtIn = canonical[row.id];
    const saved = exerciseDescriptorMigrations.migrate(row.payload);
    if (!builtIn?.secondaryMuscles?.length || saved.secondaryMuscles || !sameMuscles(saved.muscles, builtIn.muscles)) {
      return [];
    }
    return [{ id: row.id, payload: { ...saved, secondaryMuscles: builtIn.secondaryMuscles } }];
  });

  db.transaction((tx) => {
    for (const { id, payload } of updates) {
      tx.update(exercisesSchema).set({ payload }).where(eq(exercisesSchema.id, id)).run();
    }
    tx.insert(dataMigrationsSchema).values({ id: splitSecondaryMusclesDataMigration }).run();
  });
}

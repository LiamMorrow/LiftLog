import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { eq } from 'drizzle-orm';
import { dataMigrationsSchema, sessionsSchema } from '@/db/schema';
import { RecordedExerciseJSON } from '@/models/storage/versions/latest';
import { PreferenceService } from '../preference-service';
import { sessionMigrations } from '@/models/storage/versions/migrations/session';

export const migrateNilWeightUnitsDataMigration = 'MIGRATE_NIL_WEIGHT_UNITS';

export async function migrateNilWeightUnits(db: ExpoSQLiteDatabase, preferenceService: PreferenceService) {
  const preferredUnit = (await preferenceService.getUseImperialUnits()) ? 'pounds' : 'kilograms';

  await db.transaction(async (tx) => {
    const sessions = await tx.select().from(sessionsSchema);
    for (const row of sessions) {
      const session = sessionMigrations.migrate(row.payload);
      let hasNilWeight = false;
      const recordedExercises = session.recordedExercises.map((ex): RecordedExerciseJSON => {
        if (ex.type !== 'RecordedWeightedExercise') {
          return ex;
        }
        return {
          ...ex,
          potentialSets: ex.potentialSets.map((ps) => {
            if (ps.weight.unit !== 'nil') {
              return ps;
            }
            hasNilWeight = true;
            return { ...ps, weight: { unit: preferredUnit, value: ps.weight.value } };
          }),
        };
      });
      if (hasNilWeight) {
        await tx
          .update(sessionsSchema)
          .set({ payload: { ...session, recordedExercises } })
          .where(eq(sessionsSchema.id, session.id));
      }
    }
    await tx.insert(dataMigrationsSchema).values({ id: migrateNilWeightUnitsDataMigration });
  });
}

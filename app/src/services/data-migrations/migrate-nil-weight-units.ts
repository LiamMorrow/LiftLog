import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { eq } from 'drizzle-orm';
import { dataMigrationsSchema, weightedSetsSchema } from '@/db/schema';
import { writeSummaries } from '@/db/sessions';
import { PreferenceService } from '../preference-service';

export const migrateNilWeightUnitsDataMigration = 'MIGRATE_NIL_WEIGHT_UNITS';

export async function migrateNilWeightUnits(db: ExpoSQLiteDatabase, preferenceService: PreferenceService) {
  const preferredUnit = (await preferenceService.getUseImperialUnits()) ? 'pounds' : 'kilograms';

  db.transaction((tx) => {
    const changed = tx
      .selectDistinct({ sessionId: weightedSetsSchema.sessionId })
      .from(weightedSetsSchema)
      .where(eq(weightedSetsSchema.weightUnit, 'nil'))
      .all();
    tx.update(weightedSetsSchema)
      .set({ weightUnit: preferredUnit })
      .where(eq(weightedSetsSchema.weightUnit, 'nil'))
      .run();
    writeSummaries(
      tx,
      changed.map((x) => x.sessionId),
    );
    tx.insert(dataMigrationsSchema).values({ id: migrateNilWeightUnitsDataMigration }).run();
  });
}

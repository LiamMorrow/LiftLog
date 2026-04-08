import { LiftLog } from '@/gen/proto';
import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { KeyValueStore } from '../key-value-store';
import { MigratorV0ToLatest } from '@/models/storage/versions/migrator';
import { dataMigrationsSchema, sessionsSchema } from '@/db/schema';
import { LatestVersion, WeightJSON } from '@/models/storage/versions/latest';
import { PreferenceService } from '../preference-service';

export const importSessionsDataMigration = 'IMPORT_SESSIONS';

const storageKey = 'Progress';
export async function importSessions(
  db: ExpoSQLiteDatabase,
  keyValueStore: KeyValueStore,
  preferenceService: PreferenceService,
) {
  const preferredUnit = (await preferenceService.getUseImperialUnits())
    ? 'pounds'
    : 'kilograms';
  const storedData =
    LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2.decode(
      (await keyValueStore.getItemBytes(storageKey)) ?? Uint8Array.from([]),
    );
  // Convert old bodyweights with nil to be the set weight
  const coalesceWeightUnit = (weight: undefined | WeightJSON) =>
    weight
      ? {
          unit: weight.unit === 'nil' ? preferredUnit : weight.unit,
          value: weight.value,
        }
      : undefined;
  const completedSessionsList: (typeof sessionsSchema.$inferInsert)[] =
    storedData?.completedSessions.map((x) => {
      const session = MigratorV0ToLatest.migrateSession(x);
      return {
        payload: {
          ...session,
          bodyweight: coalesceWeightUnit(session.bodyweight),
        },
        modelVersion: LatestVersion,
        id: session.id,
      } satisfies typeof sessionsSchema.$inferInsert;
    }) ?? [];

  await db.transaction(async (tx) => {
    await tx.insert(sessionsSchema).values(completedSessionsList);
    await tx
      .insert(dataMigrationsSchema)
      .values({ id: importSessionsDataMigration });
  });
}

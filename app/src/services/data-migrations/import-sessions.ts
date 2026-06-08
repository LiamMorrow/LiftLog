import { LiftLog } from '@/gen/proto';
import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { KeyValueStore } from '../key-value-store';
import { dataMigrationsSchema, sessionsSchema } from '@/db/schema';
import { WeightJSON } from '@/models/storage/versions/latest';
import { PreferenceService } from '../preference-service';
import { ProtobufToJsonV1Migrator } from '@/models/storage/versions/v1/protobuf-migrator';
import { sessionMigrations } from '@/models/storage/versions/migrations/session';

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
      const session = sessionMigrations.migrate(
        ProtobufToJsonV1Migrator.migrateSession(x),
      );
      return {
        payload: {
          ...session,
          bodyweight: coalesceWeightUnit(session.bodyweight),
        },
        id: session.id,
      } satisfies typeof sessionsSchema.$inferInsert;
    }) ?? [];

  await db.transaction(async (tx) => {
    if (completedSessionsList.length) {
      await tx.insert(sessionsSchema).values(completedSessionsList);
    }
    await tx
      .insert(dataMigrationsSchema)
      .values({ id: importSessionsDataMigration });
  });
}

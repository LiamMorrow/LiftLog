import { LiftLog } from '@/gen/proto';
import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { KeyValueStore } from '../key-value-store';
import { dataMigrationsSchema } from '@/db/schema';
import { writeSession } from '@/db/sessions';
import { Session } from '@/models/session-models';
import { WeightJSON } from '@/models/storage/versions/latest';
import { PreferenceService } from '../preference-service';
import { ProtobufToJsonV1Migrator } from '@/models/storage/versions/initial/protobuf-migrator';
import { sessionMigrations } from '@/models/storage/versions/migrations/session';

export const importSessionsDataMigration = 'IMPORT_SESSIONS';

const storageKey = 'Progress';
export async function importSessions(
  db: ExpoSQLiteDatabase,
  keyValueStore: KeyValueStore,
  preferenceService: PreferenceService,
) {
  const preferredUnit = (await preferenceService.getUseImperialUnits()) ? 'pounds' : 'kilograms';
  const storedData = LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2.decode(
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
  const completedSessions =
    storedData?.completedSessions.map((x) => {
      const session = sessionMigrations.migrate(ProtobufToJsonV1Migrator.migrateSession(x));
      return Session.fromJSON({ ...session, bodyweight: coalesceWeightUnit(session.bodyweight) });
    }) ?? [];

  db.transaction((tx) => {
    completedSessions.forEach((session) => writeSession(tx, session));
    tx.insert(dataMigrationsSchema).values({ id: importSessionsDataMigration }).run();
  });
}

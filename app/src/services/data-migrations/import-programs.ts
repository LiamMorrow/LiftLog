import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { KeyValueStore } from '../key-value-store';
import { dataMigrationsSchema, programsSchema } from '@/db/schema';
import { LiftLog } from '@/gen/proto';
import { ProtobufToJsonV1Migrator } from '@/models/storage/versions/initial/protobuf-migrator';
import { programBlueprintMigrations } from '@/models/storage/versions/migrations';

export const importProgramsDataMigration = 'IMPORT_PROGRAMS';

const storageKey = 'SavedPrograms';
export async function importPrograms(db: ExpoSQLiteDatabase, keyValueStore: KeyValueStore) {
  const programBytes = await keyValueStore.getItemBytes(storageKey);
  if (!programBytes) {
    return;
  }
  const decoded = LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoContainerV1.decode(programBytes);
  const converted: (typeof programsSchema.$inferInsert)[] = Object.entries(decoded.programBlueprints).map(
    ([id, pojo]) =>
      ({
        id,
        payload: programBlueprintMigrations.migrate(ProtobufToJsonV1Migrator.migrateProgramBlueprint(pojo)),
        active: id === decoded.activeProgramId?.value,
      }) satisfies typeof programsSchema.$inferInsert,
  );

  await db.transaction(async (tx) => {
    if (converted.length) {
      await tx.insert(programsSchema).values(converted);
    }
    await tx.insert(dataMigrationsSchema).values({ id: importProgramsDataMigration });
  });
}

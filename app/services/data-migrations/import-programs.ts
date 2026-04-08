import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { KeyValueStore } from '../key-value-store';
import { dataMigrationsSchema, programsSchema } from '@/db/schema';
import { LiftLog } from '@/gen/proto';
import { LatestVersion } from '@/models/storage/versions/latest';
import { MigratorV0ToLatest } from '@/models/storage/versions/migrator';

export const importProgramsDataMigration = 'IMPORT_PROGRAMS';

const storageKey = 'SavedPrograms';
export async function importPrograms(
  db: ExpoSQLiteDatabase,
  keyValueStore: KeyValueStore,
) {
  const programBytes = await keyValueStore.getItemBytes(storageKey);
  if (!programBytes) {
    return;
  }
  const decoded =
    LiftLog.Ui.Models.ProgramBlueprintDao.ProgramBlueprintDaoContainerV1.decode(
      programBytes,
    );
  const converted: (typeof programsSchema.$inferInsert)[] = Object.entries(
    decoded.programBlueprints,
  ).map(
    ([id, pojo]) =>
      ({
        id,
        payload: MigratorV0ToLatest.migrateProgramBlueprint(pojo),
        modelVersion: LatestVersion,
        active: id === decoded.activeProgramId?.value,
      }) satisfies typeof programsSchema.$inferInsert,
  );

  await db.transaction(async (tx) => {
    await tx.insert(programsSchema).values(converted);
    await tx
      .insert(dataMigrationsSchema)
      .values({ id: importProgramsDataMigration });
  });
}

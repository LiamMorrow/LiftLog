import { backendAssignmentsSchema, dataMigrationsSchema } from '@/db/schema';
import { BackendFeature, builtInBackendId } from '@/models/backend';
import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';

export const seedBackendAssignmentsDataMigration = 'SEED_BACKEND_ASSIGNMENTS';

const servedByUs: BackendFeature[] = ['feed', 'aiPlanner'];

export async function seedBackendAssignments(db: ExpoSQLiteDatabase) {
  db.transaction((tx) => {
    tx.insert(backendAssignmentsSchema)
      .values(servedByUs.map((feature) => ({ feature, backendId: builtInBackendId })))
      .onConflictDoNothing()
      .run();
    tx.insert(dataMigrationsSchema).values({ id: seedBackendAssignmentsDataMigration }).run();
  });
}

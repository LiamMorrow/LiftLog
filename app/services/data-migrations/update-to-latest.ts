import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { sessionsSchema } from '@/db/schema';
import { LatestVersion } from '@/models/storage/versions/latest';
import { eq, lt } from 'drizzle-orm';
import { MigratorVAnyToLatest } from '@/models/storage/versions/migrator';

export async function updateSessionsToLatestVersion(db: ExpoSQLiteDatabase) {
  await db.transaction(async (tx) => {
    const sessionsRequiringMigration = await tx
      .select()
      .from(sessionsSchema)
      .where(lt(sessionsSchema.modelVersion, LatestVersion));
    for (const session of sessionsRequiringMigration) {
      await db
        .update(sessionsSchema)
        .set({
          modelVersion: LatestVersion,
          payload: MigratorVAnyToLatest.migrateSession(
            session.modelVersion,
            session.payload,
          ),
        })
        .where(eq(sessionsSchema.id, session.id));
    }
  });
}

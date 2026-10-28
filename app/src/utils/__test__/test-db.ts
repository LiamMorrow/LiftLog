import { writeSession } from '@/db/sessions';
import { Session } from '@/models/session-models';
import { DatabaseMigrationService } from '@/services/database-migration-service';
import { drizzle, type ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { openDatabaseAsync } from 'expo-sqlite';
import { vi } from 'vitest';

export async function createTestDb(sessions: Session[] = []): Promise<ExpoSQLiteDatabase> {
  const db = drizzle(await openDatabaseAsync(':memory:'));
  await new DatabaseMigrationService(db, { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() } as never, {
    importOldData: async () => {},
  }).migrate();
  db.transaction((tx) => sessions.forEach((session) => writeSession(tx, session)));
  return db;
}

import { dataMigrationsSchema } from '@/db/schema';
import { DatabaseMigrationService } from '@/services/database-migration-service';
import { eq } from 'drizzle-orm';
import { drizzle, type ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { openDatabaseAsync } from 'expo-sqlite';
import { describe, expect, it, vi } from 'vitest';

async function createDb(): Promise<ExpoSQLiteDatabase> {
  const db = drizzle(await openDatabaseAsync(':memory:'));
  await new DatabaseMigrationService(db, { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() } as never, {
    importOldData: async () => {},
  }).migrate();
  return db;
}

const testRows = (db: ExpoSQLiteDatabase) =>
  db.select().from(dataMigrationsSchema).where(eq(dataMigrationsSchema.id, 'first'));

describe('db.transaction', () => {
  it('rolls back every statement when the callback throws', async () => {
    const db = await createDb();

    expect(() =>
      db.transaction((tx) => {
        tx.insert(dataMigrationsSchema).values({ id: 'first' }).run();
        tx.insert(dataMigrationsSchema).values({ id: 'first' }).run();
      }),
    ).toThrow();

    expect(await testRows(db)).toEqual([]);
  });

  it('commits before an async callback runs its awaited statements, so they cannot roll back', async () => {
    const db = await createDb();

    await expect(
      db.transaction(async (tx) => {
        await tx.insert(dataMigrationsSchema).values({ id: 'first' });
        await tx.insert(dataMigrationsSchema).values({ id: 'first' });
      }),
    ).rejects.toThrow();

    expect(await testRows(db)).toEqual([{ id: 'first' }]);
  });
});

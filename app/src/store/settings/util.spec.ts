import { describe, it, expect, vi } from 'vitest';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { deserializeDatabaseAsync, openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { gunzipSync } from 'zlib';
import { DatabaseMigrationService } from '@/services/database-migration-service';
import { backendAssignmentsSchema, backendHeadersSchema, backendsSchema } from '@/db/schema';
import { getBackupBytes } from '@/store/settings/util';
import 'compression-streams-polyfill';

async function createSeededDb(): Promise<SQLiteDatabase> {
  const expoDb = await openDatabaseAsync(':memory:');
  const db = drizzle(expoDb);
  await new DatabaseMigrationService(db, { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() } as never, {
    importOldData: async () => {},
  }).migrate();

  await db
    .insert(backendsSchema)
    .values({ id: 'self', name: 'Home server', url: 'https://liftlog.example.com', kind: 'liftlog' });
  await db.insert(backendHeadersSchema).values({ backendId: 'self', name: 'X-Api-Key', value: 'super-secret' });
  await db.insert(backendAssignmentsSchema).values({ feature: 'backup', backendId: 'self' });

  return expoDb;
}

describe('getBackupBytes', () => {
  // The backup blob is plaintext gzip that lands on the very server whose credentials it would
  // otherwise carry.
  it('strips backend configuration and its secrets', async () => {
    const expoDb = await createSeededDb();

    const gzipped = await getBackupBytes({ includeFeed: true, expoDb });
    const restored = drizzle(await deserializeDatabaseAsync(gunzipSync(gzipped)));

    expect(await restored.select().from(backendsSchema)).toEqual([]);
    expect(await restored.select().from(backendHeadersSchema)).toEqual([]);
    expect(await restored.select().from(backendAssignmentsSchema)).toEqual([]);
  });

  it('leaves the source database untouched', async () => {
    const expoDb = await createSeededDb();

    await getBackupBytes({ includeFeed: true, expoDb });

    expect(await drizzle(expoDb).select().from(backendsSchema)).toHaveLength(1);
  });
});

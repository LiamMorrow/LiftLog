import { describe, it, expect, vi } from 'vitest';
import { drizzle, type ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { openDatabaseAsync } from 'expo-sqlite';
import { DatabaseMigrationService } from '@/services/database-migration-service';
import { backendAssignmentsSchema, backendHeadersSchema, backendsSchema } from '@/db/schema';
import { importBackends } from '@/services/data-migrations/import-backends';
import { PreferenceService } from '@/services/preference-service';
import { RemoteBackupSettings } from '@/store/settings/registry';

async function createTestDb(): Promise<ExpoSQLiteDatabase> {
  const db = drizzle(await openDatabaseAsync(':memory:'));
  await new DatabaseMigrationService(db, { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() } as never, {
    importOldData: async () => {},
  }).migrate();
  return db;
}

function makePreferenceService(legacy: RemoteBackupSettings) {
  return {
    getRemoteBackupSettings: vi.fn().mockResolvedValue(legacy),
    setPreference: vi.fn().mockResolvedValue(undefined),
  } as unknown as PreferenceService & { setPreference: ReturnType<typeof vi.fn> };
}

describe('importBackends', () => {
  it('creates no backend when no endpoint was ever configured', async () => {
    const db = await createTestDb();
    const preferenceService = makePreferenceService({ endpoint: '', apiKey: '', includeFeedAccount: false });

    await importBackends(db, preferenceService);

    expect(await db.select().from(backendsSchema)).toEqual([]);
    expect(await db.select().from(backendAssignmentsSchema)).toEqual([]);
  });

  it('carries the include-feed-account choice across to its own preference', async () => {
    const db = await createTestDb();
    const preferenceService = makePreferenceService({ endpoint: '', apiKey: '', includeFeedAccount: true });

    await importBackends(db, preferenceService);

    expect(preferenceService.setPreference).toHaveBeenCalledWith('backupIncludeFeedAccount', true);
  });

  // The saved endpoint is whatever the user typed, path and all, so it has to be used verbatim
  // rather than treated as a base URL to append /backup to.
  it('keeps an arbitrary endpoint path intact as a backup-only backend', async () => {
    const db = await createTestDb();
    const preferenceService = makePreferenceService({
      endpoint: 'https://example.com/some/lambda/path',
      apiKey: '',
      includeFeedAccount: false,
    });

    await importBackends(db, preferenceService);

    const [backend] = await db.select().from(backendsSchema);
    expect(backend).toMatchObject({
      url: 'https://example.com/some/lambda/path',
      kind: 'backupEndpoint',
      name: 'example.com',
    });
    expect(await db.select().from(backendAssignmentsSchema)).toEqual([{ feature: 'backup', backendId: backend!.id }]);
  });

  it('moves the api key into a header', async () => {
    const db = await createTestDb();
    const preferenceService = makePreferenceService({
      endpoint: 'https://example.com/backup',
      apiKey: 'secret',
      includeFeedAccount: false,
    });

    await importBackends(db, preferenceService);

    const [backend] = await db.select().from(backendsSchema);
    expect(await db.select().from(backendHeadersSchema)).toEqual([
      { backendId: backend!.id, name: 'X-Api-Key', value: 'secret' },
    ]);
  });

  it('writes no header when there was no api key', async () => {
    const db = await createTestDb();
    const preferenceService = makePreferenceService({
      endpoint: 'https://example.com/backup',
      apiKey: '',
      includeFeedAccount: false,
    });

    await importBackends(db, preferenceService);

    expect(await db.select().from(backendHeadersSchema)).toEqual([]);
  });
});

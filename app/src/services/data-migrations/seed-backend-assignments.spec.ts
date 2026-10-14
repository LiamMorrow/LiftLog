import { backendAssignmentsSchema } from '@/db/schema';
import { builtInBackendId } from '@/models/backend';
import { DatabaseMigrationService } from '@/services/database-migration-service';
import { seedBackendAssignments } from '@/services/data-migrations/seed-backend-assignments';
import { drizzle, type ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { openDatabaseAsync } from 'expo-sqlite';
import { describe, expect, it, vi } from 'vitest';

async function createTestDb(): Promise<ExpoSQLiteDatabase> {
  const db = drizzle(await openDatabaseAsync(':memory:'));
  await new DatabaseMigrationService(db, { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() } as never, {
    importOldData: async () => {},
  }).migrate();
  return db;
}

describe('seedBackendAssignments', () => {
  it('puts feed and the ai planner on the built-in backend', async () => {
    const db = await createTestDb();

    await seedBackendAssignments(db);

    expect(await db.select().from(backendAssignmentsSchema)).toEqual([
      { feature: 'feed', backendId: builtInBackendId },
      { feature: 'aiPlanner', backendId: builtInBackendId },
    ]);
  });

  // Backup is opt-in and stays wherever the user put it - a missing row means nowhere, deliberately.
  it('leaves backup alone', async () => {
    const db = await createTestDb();

    await seedBackendAssignments(db);

    const assignments = await db.select().from(backendAssignmentsSchema);
    expect(assignments.some((x) => x.feature === 'backup')).toBe(false);
  });

  it('does not overwrite a feed already pointed at someone else', async () => {
    const db = await createTestDb();
    await db.insert(backendAssignmentsSchema).values({ feature: 'feed', backendId: 'self-hosted' });

    await seedBackendAssignments(db);

    const feed = (await db.select().from(backendAssignmentsSchema)).find((x) => x.feature === 'feed');
    expect(feed?.backendId).toBe('self-hosted');
  });
});

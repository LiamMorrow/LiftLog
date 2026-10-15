import { drizzle, ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import { eq, sql } from 'drizzle-orm';
import type { SQLiteDatabase } from 'expo-sqlite';
import migrations from '@/drizzle/migrations';
import { dataMigrationsSchema } from '@/db/schema';
import { DatabaseImporter } from '@/services/database-import-service';
import { JsMigration, jsMigrations } from '@/services/js-migrations';
import { Logger } from '@/services/logger';

export type MigrationBundle = Parameters<typeof migrate>[1];

/** Every instance `drizzle()` returns carries its client; the exported type just does not say so. */
function clientOf(db: ExpoSQLiteDatabase): SQLiteDatabase {
  return (db as ExpoSQLiteDatabase & { $client: SQLiteDatabase }).$client;
}

export async function migrateDatabase(db: ExpoSQLiteDatabase, bundle: MigrationBundle, jsSteps: JsMigration[]) {
  const tags = bundle.journal.entries.map((entry) => entry.tag);
  const pinned = jsSteps.map((step) => {
    const index = tags.indexOf(step.after);
    if (index === -1) {
      throw new Error(`JS migration ${step.id} is pinned to unknown SQL migration ${step.after}`);
    }
    return { step, index };
  });

  for (const { step, index } of [...pinned].sort((a, b) => a.index - b.index)) {
    await migrate(db, {
      ...bundle,
      journal: { ...bundle.journal, entries: bundle.journal.entries.slice(0, index + 1) },
    });
    if (db.select().from(dataMigrationsSchema).where(eq(dataMigrationsSchema.id, step.id)).get()) {
      continue;
    }
    // A step declares tables as they were when it was written, and drizzle caches column names per table
    // name on each instance. Its own instance keeps those stale copies from shadowing the current schema.
    drizzle(clientOf(db)).transaction((tx) => {
      step.run(tx);
      tx.insert(dataMigrationsSchema).values({ id: step.id }).run();
    });
  }
  await migrate(db, bundle);
}

export class DatabaseMigrationService {
  // DO NOT Add a dependency to getState here, it gets messy quick
  constructor(
    private readonly db: ExpoSQLiteDatabase,
    private readonly logger: Logger,
    private readonly importService: DatabaseImporter,
  ) {}

  async migrate(): Promise<void> {
    const now = performance.now();
    await migrateDatabase(this.db, migrations, jsMigrations);

    await this.importService.importOldData();
    this.db.run(sql`PRAGMA foreign_keys = ON`);

    this.logger.info('Migrated DB in ' + (performance.now() - now) + 'ms');
  }
}

import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '@/drizzle/migrations';
import { dataMigrationsSchema } from '@/db/schema';
import {
  importSessions,
  importSessionsDataMigration,
} from './data-migrations/import-sessions';
import { KeyValueStore } from './key-value-store';
import { PreferenceService } from './preference-service';
import { updateSessionsToLatestVersion } from './data-migrations/update-to-latest';

export class DatabaseMigrationService {
  // DO NOT Add a dependency to getState here, it gets messy quick
  constructor(
    private readonly db: ExpoSQLiteDatabase,
    private readonly keyValueStore: KeyValueStore,
    private readonly preferenceService: PreferenceService,
  ) {}

  async migrate(): Promise<void> {
    const now = performance.now();
    await migrate(this.db, migrations);
    const dataMigrationsRun = (
      await this.db.select().from(dataMigrationsSchema)
    ).map((x) => x.id);

    if (!dataMigrationsRun.includes(importSessionsDataMigration)) {
      await importSessions(this.db, this.keyValueStore, this.preferenceService);
    }

    // We always want to update all sessions to the latest version
    await updateSessionsToLatestVersion(this.db);

    console.info('Migrated DB in ' + (performance.now() - now) + 'ms');
  }
}

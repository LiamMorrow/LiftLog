import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '@/drizzle/migrations';
import { DatabaseImporter } from '@/services/database-import-service';
import { Logger } from '@/services/logger';

export class DatabaseMigrationService {
  // DO NOT Add a dependency to getState here, it gets messy quick
  constructor(
    private readonly db: ExpoSQLiteDatabase,
    private readonly logger: Logger,
    private readonly importService: DatabaseImporter,
  ) {}

  async migrate(): Promise<void> {
    const now = performance.now();
    await migrate(this.db, migrations);

    await this.importService.importOldData();

    this.logger.info('Migrated DB in ' + (performance.now() - now) + 'ms');
  }
}

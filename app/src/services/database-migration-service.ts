import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '@/drizzle/migrations';

import {
  updateExercisesToLatestVersion,
  updateFeedFollowedUsersToLatestVersion,
  updateFeedFollowerUsersToLatestVersion,
  updateFeedFollowRequestsToLatestVersion,
  updateFeedIdentityToLatestVersion,
  updateFeedItemsToLatestVersion,
  updateProgramsToLatestVersion,
  updateSessionsToLatestVersion,
} from './data-migrations/update-to-latest';
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

    // We always want to update all entities to the latest version
    await updateSessionsToLatestVersion(this.db);
    await updateProgramsToLatestVersion(this.db);
    await updateExercisesToLatestVersion(this.db);
    await updateFeedIdentityToLatestVersion(this.db);
    await updateFeedFollowedUsersToLatestVersion(this.db);
    await updateFeedItemsToLatestVersion(this.db);
    await updateFeedFollowerUsersToLatestVersion(this.db);
    await updateFeedFollowRequestsToLatestVersion(this.db);

    this.logger.info('Migrated DB in ' + (performance.now() - now) + 'ms');
  }
}

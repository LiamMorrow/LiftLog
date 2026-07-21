import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { dataMigrationsSchema } from '@/db/schema';
import { importSessions, importSessionsDataMigration } from './data-migrations/import-sessions';
import { KeyValueStore } from './key-value-store';
import { PreferenceService } from './preference-service';

import { importPrograms, importProgramsDataMigration } from './data-migrations/import-programs';
import { importExercises, importExercisesDataMigration } from './data-migrations/import-exercises';
import {
  importExercisesFromWorkouts,
  importExercisesFromWorkoutsDataMigration,
} from '@/services/data-migrations/import-exercises-from-workouts';
import { importFeed, importFeedDataMigration } from '@/services/data-migrations/import-feed';
import {
  migrateNilWeightUnits,
  migrateNilWeightUnitsDataMigration,
} from '@/services/data-migrations/migrate-nil-weight-units';
import {
  dedupeBuiltInExercises,
  dedupeBuiltInExercisesDataMigration,
} from '@/services/data-migrations/dedupe-builtin-exercises';

export interface DatabaseImporter {
  importOldData(): Promise<void>;
}

export class DatabaseImportService implements DatabaseImporter {
  // DO NOT Add a dependency to getState here, it gets messy quick
  constructor(
    private readonly db: ExpoSQLiteDatabase,
    private readonly keyValueStore: KeyValueStore,
    private readonly preferenceService: PreferenceService,
  ) {}

  async importOldData(): Promise<void> {
    const now = performance.now();
    const dataMigrationsRun = (await this.db.select().from(dataMigrationsSchema)).map((x) => x.id);

    if (!dataMigrationsRun.includes(importSessionsDataMigration)) {
      await importSessions(this.db, this.keyValueStore, this.preferenceService);
    }
    if (!dataMigrationsRun.includes(importProgramsDataMigration)) {
      await importPrograms(this.db, this.keyValueStore);
    }
    if (!dataMigrationsRun.includes(importExercisesDataMigration)) {
      await importExercises(this.db, this.keyValueStore);
    }
    if (!dataMigrationsRun.includes(importExercisesFromWorkoutsDataMigration)) {
      await importExercisesFromWorkouts(this.db);
    }
    if (!dataMigrationsRun.includes(importFeedDataMigration)) {
      await importFeed(this.db, this.keyValueStore);
    }
    if (!dataMigrationsRun.includes(migrateNilWeightUnitsDataMigration)) {
      await migrateNilWeightUnits(this.db, this.preferenceService);
    }
    if (!dataMigrationsRun.includes(dedupeBuiltInExercisesDataMigration)) {
      await dedupeBuiltInExercises(this.db, this.keyValueStore);
    }

    console.info('Imported old data to DB in ' + (performance.now() - now) + 'ms');
  }
}

import type { migrate as ExpoMigrate } from 'drizzle-orm/expo-sqlite/migrator';
import { migrate as libsqlMigrate } from 'drizzle-orm/libsql/migrator';
import { drizzle } from 'drizzle-orm/libsql';
import { resolve } from 'node:path';

export const migrate: typeof ExpoMigrate = async (db, _config) => {
  const libsqlDb = db as unknown as ReturnType<typeof drizzle>;
  await libsqlMigrate(libsqlDb, {
    migrationsFolder: resolve(__dirname, '../../src/drizzle'),
  });
};

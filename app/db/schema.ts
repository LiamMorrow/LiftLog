import { SessionJSON } from '@/models/storage/versions/latest';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const sessionsSchema = sqliteTable('session', {
  id: text().primaryKey(),
  modelVersion: integer().notNull(),
  payload: text('payload', { mode: 'json' }).$type<SessionJSON>().notNull(),
});

// Just a table we can use to keep track of which data migrations have been run
export const dataMigrationsSchema = sqliteTable('data_migration', {
  id: text().primaryKey(),
});

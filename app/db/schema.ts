import {
  ExerciseDescriptorJSON,
  ProgramBlueprintJSON,
  SessionJSON,
} from '@/models/storage/versions/latest';
import { sql } from 'drizzle-orm';
import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

export const sessionsSchema = sqliteTable('session', {
  id: text().primaryKey(),
  modelVersion: integer().notNull(),
  payload: text('payload', { mode: 'json' }).$type<SessionJSON>().notNull(),
});

export const exercisesSchema = sqliteTable('exercise', {
  id: text().primaryKey(),
  modelVersion: integer().notNull(),
  payload: text('payload', { mode: 'json' })
    .$type<ExerciseDescriptorJSON>()
    .notNull(),
});

export const programsSchema = sqliteTable(
  'program',
  {
    id: text().primaryKey(),
    modelVersion: integer().notNull(),
    active: integer({ mode: 'boolean' }).notNull(),
    payload: text('payload', { mode: 'json' })
      .$type<ProgramBlueprintJSON>()
      .notNull(),
  },
  (table) => [
    uniqueIndex('single_active_program')
      .on(table.active)
      .where(sql`${table.active} = 1`),
  ],
);

// Just a table we can use to keep track of which data migrations have been run
export const dataMigrationsSchema = sqliteTable('data_migration', {
  id: text().primaryKey(),
});

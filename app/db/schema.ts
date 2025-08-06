import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const exerciseTable = sqliteTable('exercise', {
  id: int().primaryKey({ autoIncrement: true }),
  isBuiltIn: int({ mode: 'boolean' }).notNull(), // boolean
  name: text().notNull(),
  force: text(),
  level: text().notNull(),
  mechanic: text(),
  equipment: text().notNull(),
  primaryMuscles: text({ mode: 'json' }).$type<string[]>().notNull(), // JSON string array
  secondaryMuscles: text({ mode: 'json' }).$type<string[]>().notNull(), // JSON string array
  instructions: text({ mode: 'json' }).$type<string[]>().notNull(), // JSON string array
  category: text().notNull(),
});

export const migrationVersionsTable = sqliteTable('migration_version', {
  builtInExerciseListVersion: int().notNull(),
});

import { LatestVersion } from '@/models/storage/versions/latest';
import { Column, sql } from 'drizzle-orm';
import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { AnySQLiteTable, IndexColumn } from 'drizzle-orm/sqlite-core';

type JsonTableValue<T, K> = {
  id: K;
  payload: T;
  modelVersion: number;
};

export async function upsert<T, K>(
  db: ExpoSQLiteDatabase,
  schema: AnySQLiteTable & {
    id: IndexColumn;
    payload: Column & { _: { $type: T } };
  },
  values: JsonTableValue<T, K>[],
) {
  if (!values.length) {
    return;
  }
  await db
    .insert(schema)
    .values(values)
    .onConflictDoUpdate({
      target: schema.id,
      set: {
        payload: sql.raw(`excluded.${schema.payload.name}`),
        modelVersion: LatestVersion,
      },
    });
}

import { dataMigrationsSchema } from '@/db/schema';
import { migrateDatabase, type MigrationBundle } from '@/services/database-migration-service';
import { JsMigration } from '@/services/js-migrations';
import { sql } from 'drizzle-orm';
import { drizzle, type ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { openDatabaseAsync } from 'expo-sqlite';
import { describe, expect, it } from 'vitest';

const bundle: MigrationBundle = {
  journal: {
    entries: [
      { idx: 0, when: 1, tag: '0000_create', breakpoints: true },
      { idx: 1, when: 2, tag: '0001_rename', breakpoints: true },
    ],
  },
  migrations: {
    m0000:
      'CREATE TABLE `data_migration` (`id` text PRIMARY KEY NOT NULL);--> statement-breakpoint\nCREATE TABLE `thing` (`id` text PRIMARY KEY NOT NULL);',
    m0001: 'ALTER TABLE `thing` RENAME TO `thing_v2`;',
  },
};

const firstOnly: MigrationBundle = { ...bundle, journal: { entries: bundle.journal.entries.slice(0, 1) } };

const insertIntoThing = (id: string): JsMigration => ({
  id: `INSERT_${id}`,
  after: '0000_create',
  run: (db) => {
    db.run(sql.raw(`INSERT INTO thing (id) VALUES ('${id}')`));
  },
});

const createDb = async () => drizzle(await openDatabaseAsync(':memory:'));

const thingIds = (db: ExpoSQLiteDatabase) => db.all<{ id: string }>(sql`SELECT id FROM thing_v2`).map((x) => x.id);

const appliedSqlMigrations = (db: ExpoSQLiteDatabase) =>
  db.all<{ created_at: number }>(sql`SELECT created_at FROM __drizzle_migrations`).length;

describe('migrateDatabase', () => {
  it('runs a JS migration after the SQL migration it is pinned to and before later ones', async () => {
    const db = await createDb();

    await migrateDatabase(db, bundle, [insertIntoThing('a')]);

    expect(thingIds(db)).toEqual(['a']);
    expect(await db.select().from(dataMigrationsSchema)).toEqual([{ id: 'INSERT_a' }]);
  });

  it('runs JS migrations pinned to the same SQL migration in list order', async () => {
    const db = await createDb();
    const order: string[] = [];
    const record = (id: string): JsMigration => ({ id, after: '0000_create', run: () => order.push(id) });

    await migrateDatabase(db, bundle, [record('first'), record('second')]);

    expect(order).toEqual(['first', 'second']);
  });

  it('does not run a JS migration again once it has been recorded', async () => {
    const db = await createDb();
    await migrateDatabase(db, bundle, [insertIntoThing('a')]);

    await migrateDatabase(db, bundle, [insertIntoThing('a')]);

    expect(thingIds(db)).toEqual(['a']);
  });

  it('runs a JS migration on a database that already has the SQL migration it is pinned to', async () => {
    const db = await createDb();
    await migrateDatabase(db, firstOnly, []);

    await migrateDatabase(db, bundle, [insertIntoThing('a')]);

    expect(thingIds(db)).toEqual(['a']);
  });

  it('rolls back a failed JS migration, leaves it unrecorded and stops before later SQL migrations', async () => {
    const db = await createDb();
    const failing: JsMigration = {
      id: 'FAILS',
      after: '0000_create',
      run: (tx) => {
        tx.run(sql`INSERT INTO thing (id) VALUES ('a')`);
        throw new Error('boom');
      },
    };

    await expect(migrateDatabase(db, bundle, [failing])).rejects.toThrow('boom');

    expect(db.all(sql`SELECT id FROM thing`)).toEqual([]);
    expect(await db.select().from(dataMigrationsSchema)).toEqual([]);
    expect(appliedSqlMigrations(db)).toBe(1);
  });

  it('throws when a JS migration is pinned to a SQL migration that does not exist', async () => {
    const db = await createDb();

    await expect(migrateDatabase(db, bundle, [{ id: 'LOST', after: '0002_missing', run: () => {} }])).rejects.toThrow(
      '0002_missing',
    );
    expect(db.all(sql`SELECT name FROM sqlite_master`)).toEqual([]);
  });
});

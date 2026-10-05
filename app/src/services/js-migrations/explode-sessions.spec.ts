import migrations from '@/drizzle/migrations';
import { sessionLegacySchema } from '@/db/schema';
import { readPersonalRecords, readSessions, readStartedSessionVolumes } from '@/db/sessions';
import { Rest } from '@/models/blueprint-models';
import { RecordedCardioExercise, Session } from '@/models/session-models';
import {
  makeCardioBlueprint,
  makeRecordedExercise,
  makeSession,
  makeWeightedBlueprint,
  tickAt,
} from '@/models/session-models/__test__/helpers';
import { Weight } from '@/models/weight';
import { migrateDatabase, type MigrationBundle } from '@/services/database-migration-service';
import { jsMigrations } from '@/services/js-migrations';
import { sql } from 'drizzle-orm';
import { drizzle, type ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { openDatabaseAsync } from 'expo-sqlite';
import { describe, expect, it } from 'vitest';

const before0009: MigrationBundle = {
  ...migrations,
  journal: {
    ...migrations.journal,
    entries: migrations.journal.entries.filter((x) => x.tag < '0009_relational_sessions'),
  },
};

async function createLegacyDb(sessions: { session: Session; active: boolean }[]): Promise<ExpoSQLiteDatabase> {
  const db = drizzle(await openDatabaseAsync(':memory:'));
  await migrateDatabase(db, before0009, []);
  for (const { session, active } of sessions) {
    db.run(
      sql`INSERT INTO session (id, active, payload) VALUES (${session.id}, ${active ? 1 : 0}, ${JSON.stringify(session.toJSON())})`,
    );
  }
  return db;
}

function workout() {
  const squat = makeWeightedBlueprint({ restBetweenSets: Rest.medium });
  const row = makeCardioBlueprint(2);
  return makeSession([squat, row]).with({
    bodyweight: new Weight(80.5, 'kilograms'),
    recordedExercises: [
      makeRecordedExercise(squat, [5, undefined, 3], new Weight(102.5, 'kilograms'), () => tickAt(9, 30)),
      RecordedCardioExercise.empty(row),
    ],
  });
}

const json = (session: Session | undefined) => session && Session.fromJSON(session.toJSON()).toJSON();

describe('EXPLODE_SESSIONS', () => {
  it('copies every legacy session into the relational tables, keeping the workout in progress active', async () => {
    const finished = workout();
    const inProgress = workout();
    const db = await createLegacyDb([
      { session: finished, active: false },
      { session: inProgress, active: true },
    ]);

    await migrateDatabase(db, migrations, jsMigrations);

    const { sessions, activeSessionId } = readSessions(db);
    expect(sessions.map(json)).toEqual([json(finished), json(inProgress)]);
    expect(activeSessionId).toBe(inProgress.id);
  });

  it('leaves the legacy rows in place', async () => {
    const db = await createLegacyDb([{ session: workout(), active: false }]);

    await migrateDatabase(db, migrations, jsMigrations);

    expect(db.select().from(sessionLegacySchema).all()).toHaveLength(1);
  });
});

describe('0011_session_summary', () => {
  it('summarises every stored session for the whole-history reads', async () => {
    const squat = makeWeightedBlueprint();
    const pullUp = makeWeightedBlueprint({ name: 'Pull up', resistance: 'bodyweight' });
    const earlier = makeSession([squat, pullUp]).with({
      bodyweight: new Weight(80, 'kilograms'),
      recordedExercises: [
        makeRecordedExercise(squat, [5, 5], new Weight(100, 'kilograms'), () => tickAt(9, 0)),
        makeRecordedExercise(pullUp, [10], new Weight(10, 'kilograms'), () => tickAt(9, 30)),
      ],
    });
    const later = makeSession([squat]).with({
      recordedExercises: [makeRecordedExercise(squat, [5], new Weight(110, 'kilograms'), () => tickAt(10, 0))],
    });
    const db = await createLegacyDb([
      { session: earlier, active: false },
      { session: later, active: false },
    ]);

    await migrateDatabase(db, migrations, jsMigrations);

    expect(new Map(readStartedSessionVolumes(db).map((x) => [x.id, x.volumeKg]))).toEqual(
      new Map([
        [earlier.id, 1900],
        [later.id, 550],
      ]),
    );
    expect(readPersonalRecords(db).map((x) => `${x.sessionId}:${x.exerciseName}`)).toEqual([`${later.id}:Squat`]);
  });
});

import { cardioSetsSchema, recordedExercisesSchema, sessionsSchema, weightedSetsSchema } from '@/db/schema';
import {
  deleteSession,
  readActiveSession,
  readEarliestSessionDate,
  readExistingSessionIds,
  readLatestExercises,
  readPersonalRecords,
  readPreviousComparableSession,
  readExerciseHistory,
  readPreviousExercises,
  readSession,
  readSessions,
  readSessionsBetween,
  readSessionToContinueFrom,
  readStartedSessionVolumes,
  setActiveSession,
  writeSession,
} from '@/db/sessions';
import {
  CardioExerciseBlueprint,
  CardioExerciseSetBlueprint,
  movementKeyFor,
  Rest,
  SessionBlueprint,
} from '@/models/blueprint-models';
import {
  freeformSessionName,
  RecordedCardioExercise,
  RecordedExercise,
  RecordedWeightedExercise,
  Session,
} from '@/models/session-models';
import {
  makeCardioBlueprint,
  makeRecordedExercise,
  makeSession,
  makeWeightedBlueprint,
  tickAt,
} from '@/models/session-models/__test__/helpers';
import { SessionGenerator } from '@/models/storage/generators';
import { TemporalComparer } from '@/models/comparers';
import { sessionVolume } from '@/store/activity/volume';
import { findPersonalRecords } from '@/store/stats/personal-records';
import { getSessionReferenceTime } from '@/store/stored-sessions';
import { DatabaseMigrationService } from '@/services/database-migration-service';
import { Weight } from '@/models/weight';
import { Duration, LocalDate, OffsetDateTime, ZoneId } from '@js-joda/core';
import BigNumber from 'bignumber.js';
import { eq, sql } from 'drizzle-orm';
import { drizzle, type ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { openDatabaseAsync } from 'expo-sqlite';
import fc from 'fast-check';
import { v4 as uuid } from 'uuid';
import { beforeEach, describe, expect, it, vi } from 'vitest';

async function createDb(): Promise<ExpoSQLiteDatabase> {
  const db = drizzle(await openDatabaseAsync(':memory:'));
  await new DatabaseMigrationService(db, { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() } as never, {
    importOldData: async () => {},
  }).migrate();
  return db;
}

function canonical(session: Session): Session {
  const normalized = session.with({
    recordedExercises: session.recordedExercises.map((exercise) =>
      exercise instanceof RecordedCardioExercise
        ? exercise.with({
            blueprint: exercise.blueprint.with({ sets: exercise.sets.map((set) => set.blueprint) }),
            sets: exercise.sets.map((set) =>
              set.with({ duration: set.duration && Duration.ofMillis(set.duration.toMillis()) }),
            ),
          })
        : exercise,
    ),
  });
  return Session.fromJSON(normalized.toJSON());
}

const read = (db: ExpoSQLiteDatabase, id: string) => readSessions(db).sessions.find((x) => x.id === id);

const countRows = (db: ExpoSQLiteDatabase) => ({
  sessions: db.select().from(sessionsSchema).all().length,
  exercises: db.select().from(recordedExercisesSchema).all().length,
  weightedSets: db.select().from(weightedSetsSchema).all().length,
  cardioSets: db.select().from(cardioSetsSchema).all().length,
});

function workout() {
  const squat = makeWeightedBlueprint({ restBetweenSets: Rest.medium, supersetWithNext: true });
  return makeSession([squat, makeCardioBlueprint(2)]).with({
    bodyweight: new Weight(80.5, 'kilograms'),
    recordedExercises: [
      makeRecordedExercise(squat, [5, undefined, 3], new Weight(102.5, 'kilograms'), () => tickAt(9, 30)),
      RecordedCardioExercise.empty(makeCardioBlueprint(2)),
    ],
  });
}

describe('session tables', () => {
  let db: ExpoSQLiteDatabase;

  beforeEach(async () => {
    db = await createDb();
  });

  it('reads back every session it writes', () => {
    fc.assert(
      fc.property(SessionGenerator, (generated) => {
        const session = canonical(generated);

        db.transaction((tx) => writeSession(tx, session));

        expect(read(db, session.id)?.toJSON()).toEqual(session.toJSON());
        db.transaction((tx) => deleteSession(tx, session.id));
      }),
    );
  });

  it('replaces the exercises and sets of a session it already stored', () => {
    const session = workout();
    db.transaction((tx) => writeSession(tx, session));

    const trimmed = canonical(session.with({ recordedExercises: session.recordedExercises.slice(0, 1) }));
    db.transaction((tx) => writeSession(tx, trimmed));

    expect(read(db, session.id)?.toJSON()).toEqual(trimmed.toJSON());
    expect(countRows(db)).toEqual({ sessions: 1, exercises: 1, weightedSets: 3, cardioSets: 0 });
  });

  it('stores durations as milliseconds and completion times with their epoch millis', () => {
    const session = workout();

    db.transaction((tx) => writeSession(tx, session));

    const [exercise] = db.select().from(recordedExercisesSchema).where(eq(recordedExercisesSchema.ord, 0)).all();
    expect(exercise?.restMinMs).toBe(Rest.medium.minRest.toMillis());
    const [set] = db.select().from(weightedSetsSchema).where(eq(weightedSetsSchema.ord, 0)).all();
    expect(set?.completedAtMs).toBe(tickAt(9, 30).toInstant().toEpochMilli());
  });

  it('stores a new session inactive, and writing an active one leaves its flag alone', () => {
    const session = workout();

    db.transaction((tx) => writeSession(tx, session));
    expect(readSessions(db).activeSessionId).toBeUndefined();

    db.transaction((tx) => setActiveSession(tx, session));
    db.transaction((tx) => writeSession(tx, session.with({ date: session.date.plusDays(1) })));
    expect(readSessions(db).activeSessionId).toBe(session.id);
  });

  it('keeps at most one session active, and clears it', () => {
    const first = workout();
    const second = workout();

    db.transaction((tx) => setActiveSession(tx, first));
    db.transaction((tx) => setActiveSession(tx, second));
    expect(readSessions(db).activeSessionId).toBe(second.id);
    expect(read(db, first.id)).toBeDefined();

    db.transaction((tx) => setActiveSession(tx, undefined));
    expect(readSessions(db).activeSessionId).toBeUndefined();
  });

  it('deletes a session along with its exercises and sets', () => {
    const kept = workout();
    const deleted = workout();
    db.transaction((tx) => {
      writeSession(tx, kept);
      writeSession(tx, deleted);
    });

    db.transaction((tx) => deleteSession(tx, deleted.id));

    expect(readSessions(db).sessions.map((x) => x.id)).toEqual([kept.id]);
    expect(countRows(db)).toEqual({ sessions: 1, exercises: 2, weightedSets: 3, cardioSets: 2 });
  });

  it('enforces foreign keys once migrated, so deleting a session row cascades', () => {
    db.transaction((tx) => writeSession(tx, workout()));

    db.run(sql`DELETE FROM session`);

    expect(countRows(db)).toEqual({ sessions: 0, exercises: 0, weightedSets: 0, cardioSets: 0 });
  });
});

function sessionOf(name: string, exercises: RecordedExercise[], date = LocalDate.of(2025, 4, 5)) {
  return new Session(
    uuid(),
    new SessionBlueprint(
      name,
      exercises.map((x) => x.blueprint),
      '',
    ),
    exercises,
    date,
    undefined,
    undefined,
  );
}

const squatAt = (at: OffsetDateTime, weight = 100) =>
  makeRecordedExercise(makeWeightedBlueprint(), [10], new Weight(weight, 'kilograms'), () => at);

describe('readSessionToContinueFrom', () => {
  let db: ExpoSQLiteDatabase;
  const store = (...sessions: Session[]) =>
    db.transaction((tx) => sessions.forEach((session) => writeSession(tx, session)));

  beforeEach(async () => {
    db = await createDb();
  });

  it('finds nothing before the first session', () => {
    expect(readSessionToContinueFrom(db)).toBeUndefined();
  });

  it('continues from the session whose last set was completed most recently, whatever its date', () => {
    store(
      sessionOf('Push', [squatAt(tickAt(9, 0))], LocalDate.of(2025, 4, 9)),
      sessionOf('Pull', [squatAt(tickAt(10, 0))], LocalDate.of(2025, 4, 1)),
    );

    expect(readSessionToContinueFrom(db)?.name).toBe('Pull');
  });

  it('places a session with nothing completed at the start of its date', () => {
    store(
      sessionOf('Push', [squatAt(tickAt(9, 0))], LocalDate.of(2025, 4, 5)),
      sessionOf('Pull', [makeRecordedExercise(makeWeightedBlueprint(), [undefined])], LocalDate.of(2025, 4, 7)),
      sessionOf('Legs', [], LocalDate.of(2025, 4, 3)),
    );

    expect(readSessionToContinueFrom(db)?.name).toBe('Pull');
  });

  it('skips freeform workouts, which are not part of the plan', () => {
    store(sessionOf('Push', [squatAt(tickAt(9, 0))]), sessionOf(freeformSessionName, [squatAt(tickAt(10, 0))]));

    expect(readSessionToContinueFrom(db)?.name).toBe('Push');
  });

  it('continues from the workout in progress over any finished one', () => {
    const inProgress = sessionOf(freeformSessionName, [squatAt(tickAt(8, 0))]);
    store(sessionOf('Push', [squatAt(tickAt(9, 0))]));
    db.transaction((tx) => setActiveSession(tx, inProgress));

    expect(readSessionToContinueFrom(db)?.name).toBe(freeformSessionName);
  });

  it('carries the bodyweight', () => {
    store(sessionOf('Push', [squatAt(tickAt(9, 0))]).with({ bodyweight: new Weight(80.5, 'kilograms') }));

    expect(readSessionToContinueFrom(db)?.bodyweight?.toJSON()).toEqual(new Weight(80.5, 'kilograms').toJSON());
  });
});

describe('readLatestExercises', () => {
  let db: ExpoSQLiteDatabase;
  const store = (...sessions: Session[]) =>
    db.transaction((tx) => sessions.forEach((session) => writeSession(tx, session)));
  const squatKey = makeWeightedBlueprint().progressionKey();

  beforeEach(async () => {
    db = await createDb();
  });

  it('reads the most recently completed performance of each lineage', () => {
    store(
      sessionOf('Later', [squatAt(tickAt(10, 0), 110)], LocalDate.of(2025, 4, 1)),
      sessionOf('Earlier', [squatAt(tickAt(9, 0), 90)], LocalDate.of(2025, 4, 9)),
    );

    const latest = readLatestExercises(db, [squatKey])[squatKey] as RecordedWeightedExercise;

    expect(latest.potentialSets.map((x) => x.weight.value.toNumber())).toEqual([110]);
  });

  it('passes over a later performance with nothing completed', () => {
    store(
      sessionOf('Completed', [squatAt(tickAt(9, 0), 100)]),
      sessionOf('Abandoned', [makeRecordedExercise(makeWeightedBlueprint(), [undefined], new Weight(0, 'kilograms'))]),
    );

    const latest = readLatestExercises(db, [squatKey])[squatKey] as RecordedWeightedExercise;

    expect(latest.potentialSets.map((x) => x.weight.value.toNumber())).toEqual([100]);
  });

  it('reads cardio alongside weighted lineages, and only the lineages asked for', () => {
    const row = makeCardioBlueprint(2);
    const rowed = RecordedCardioExercise.empty(row).with({
      sets: RecordedCardioExercise.empty(row).sets.map((set) =>
        set.with({ completionDateTime: tickAt(9, 0), incline: BigNumber(3) }),
      ),
    });
    const bench = makeWeightedBlueprint({ name: 'Bench' });
    store(sessionOf('Day', [squatAt(tickAt(9, 0)), rowed, makeRecordedExercise(bench, [10])]));

    const latest = readLatestExercises(db, [squatKey, row.progressionKey()]);

    expect(Object.keys(latest).sort()).toEqual([squatKey, row.progressionKey()].sort());
    expect((latest[row.progressionKey()] as RecordedCardioExercise).sets.map((x) => x.incline?.toNumber())).toEqual([
      3, 3,
    ]);
  });

  it('reads nothing for a lineage that was never completed', () => {
    store(sessionOf('Day', [makeRecordedExercise(makeWeightedBlueprint(), [undefined])]));

    expect(readLatestExercises(db, [squatKey])).toEqual({});
    expect(readLatestExercises(db, [])).toEqual({});
  });
});

describe('reading sessions by what is asked for', () => {
  let db: ExpoSQLiteDatabase;
  const store = (...sessions: Session[]) =>
    db.transaction((tx) => sessions.forEach((session) => writeSession(tx, session)));

  beforeEach(async () => {
    db = await createDb();
  });

  it('reads one session by id, with its exercises and sets', () => {
    const wanted = canonical(workout());
    store(wanted, workout());

    expect(readSession(db, wanted.id)?.toJSON()).toEqual(wanted.toJSON());
    expect(readSession(db, uuid())).toBeUndefined();
  });

  it('reads the workout in progress apart from the finished ones', () => {
    const finished = sessionOf('Push', [squatAt(tickAt(9, 0))]);
    const inProgress = sessionOf('Pull', [squatAt(tickAt(10, 0))]);
    store(finished);
    db.transaction((tx) => setActiveSession(tx, inProgress));

    expect(readActiveSession(db)?.id).toBe(inProgress.id);
    const thisYear = readSessionsBetween(db, LocalDate.of(2025, 1, 1), LocalDate.of(2025, 12, 31));
    expect(thisYear.map((x) => x.id)).toEqual([finished.id]);
  });

  it('reads finished sessions dated within a range, inclusive at both ends', () => {
    const before = sessionOf('Before', [], LocalDate.of(2025, 3, 31));
    const first = sessionOf('First', [], LocalDate.of(2025, 4, 1));
    const last = sessionOf('Last', [], LocalDate.of(2025, 4, 30));
    const after = sessionOf('After', [], LocalDate.of(2025, 5, 1));
    store(before, first, last, after);

    const names = readSessionsBetween(db, LocalDate.of(2025, 4, 1), LocalDate.of(2025, 4, 30)).map(
      (x) => x.blueprint.name,
    );

    expect(names.sort()).toEqual(['First', 'Last']);
  });

  it('reads the date of the earliest finished session', () => {
    expect(readEarliestSessionDate(db)).toBeUndefined();
    const inProgress = sessionOf('Now', [], LocalDate.of(2025, 1, 1));
    store(sessionOf('Later', [], LocalDate.of(2025, 4, 9)), sessionOf('Earlier', [], LocalDate.of(2025, 4, 2)));
    db.transaction((tx) => setActiveSession(tx, inProgress));

    expect(readEarliestSessionDate(db)?.toString()).toBe('2025-04-02');
  });

  it('reads which of the given ids are stored', () => {
    const stored = sessionOf('Push', []);
    store(stored);
    const missing = uuid();

    expect([...readExistingSessionIds(db, [stored.id, missing])]).toEqual([stored.id]);
    expect(readExistingSessionIds(db, []).size).toBe(0);
  });
});

describe('readExerciseHistory', () => {
  let db: ExpoSQLiteDatabase;
  const store = (...sessions: Session[]) =>
    db.transaction((tx) => sessions.forEach((session) => writeSession(tx, session)));
  const squatKey = makeWeightedBlueprint().movementKey();

  beforeEach(async () => {
    db = await createDb();
  });

  it('reads every started performance of a movement, newest first', () => {
    store(
      sessionOf('Earlier', [squatAt(tickAt(9, 0), 90)], LocalDate.of(2025, 4, 9)),
      sessionOf('Later', [squatAt(tickAt(10, 0), 110)], LocalDate.of(2025, 4, 1)),
      sessionOf('Abandoned', [makeRecordedExercise(makeWeightedBlueprint(), [undefined])]),
    );

    const weights = (readExerciseHistory(db, squatKey) as RecordedWeightedExercise[]).map((x) =>
      x.potentialSets[0]?.weight.value.toNumber(),
    );

    expect(weights).toEqual([110, 90]);
  });

  it('counts the same movement under another rep scheme', () => {
    const threeByEight = makeWeightedBlueprint({ sets: 3, repsConfig: { type: 'fixed', reps: 8 } });
    store(
      sessionOf('Day', [
        makeRecordedExercise(threeByEight, [8, 8, 8], new Weight(80, 'kilograms'), () => tickAt(9, 0)),
      ]),
    );

    expect(readExerciseHistory(db, squatKey)).toHaveLength(1);
  });

  it('leaves out the workout in progress', () => {
    store(sessionOf('Kept', [squatAt(tickAt(8, 0))]));
    db.transaction((tx) => setActiveSession(tx, sessionOf('Now', [squatAt(tickAt(10, 0))])));

    expect(readExerciseHistory(db, squatKey)).toHaveLength(1);
  });
});

describe('readPreviousExercises', () => {
  let db: ExpoSQLiteDatabase;
  const store = (...sessions: Session[]) =>
    db.transaction((tx) => sessions.forEach((session) => writeSession(tx, session)));
  const forget = (...sessions: Session[]) =>
    db.transaction((tx) => sessions.forEach((session) => deleteSession(tx, session.id)));
  const weightOf = (exercise: RecordedExercise | undefined) =>
    (exercise as RecordedWeightedExercise | undefined)?.potentialSets[0]?.weight.value.toNumber();

  beforeEach(async () => {
    db = await createDb();
  });

  it('reads the latest performance of each lineage, not of the movement', () => {
    const fiveByFive = makeWeightedBlueprint({ sets: 5, repsConfig: { type: 'fixed', reps: 5 } });
    const threeByEight = makeWeightedBlueprint({ sets: 3, repsConfig: { type: 'fixed', reps: 8 } });
    store(
      sessionOf('Older', [makeRecordedExercise(fiveByFive, [5], new Weight(100, 'kilograms'), () => tickAt(8, 0))]),
      sessionOf('Old', [makeRecordedExercise(fiveByFive, [5], new Weight(105, 'kilograms'), () => tickAt(9, 0))]),
      sessionOf('New', [makeRecordedExercise(threeByEight, [8], new Weight(80, 'kilograms'), () => tickAt(10, 0))]),
    );

    const previous = readPreviousExercises(db, [fiveByFive.progressionKey(), threeByEight.progressionKey()], uuid());

    expect(weightOf(previous[fiveByFive.progressionKey()])).toBe(105);
    expect(weightOf(previous[threeByEight.progressionKey()])).toBe(80);
  });

  it('leaves out the excluded session, the workout in progress, and performances with nothing completed', () => {
    const excluded = sessionOf('Excluded', [squatAt(tickAt(9, 0), 120)]);
    store(
      excluded,
      sessionOf('Kept', [squatAt(tickAt(8, 0), 100)]),
      sessionOf('Abandoned', [makeRecordedExercise(makeWeightedBlueprint(), [undefined])]),
    );
    db.transaction((tx) => setActiveSession(tx, sessionOf('Now', [squatAt(tickAt(10, 0), 140)])));
    const squatKey = makeWeightedBlueprint().progressionKey();

    expect(weightOf(readPreviousExercises(db, [squatKey], excluded.id)[squatKey])).toBe(100);
    expect(readPreviousExercises(db, [], excluded.id)).toEqual({});
  });

  it('agrees with the newest performance of each lineage in its history', () => {
    fc.assert(
      fc.property(fc.uniqueArray(SessionGenerator, { selector: (x) => x.id, maxLength: 4 }), (generated) => {
        const sessions = generated.map(canonical);
        store(...sessions);
        try {
          const exercises = sessions.flatMap((x) => x.recordedExercises);
          const previous = readPreviousExercises(db, [...new Set(exercises.map((x) => x.progressionKey()))], uuid());

          for (const movementKey of new Set(exercises.map((x) => x.movementKey()))) {
            const history = readExerciseHistory(db, movementKey);
            for (const lineage of new Set(
              exercises.filter((x) => x.movementKey() === movementKey).map((x) => x.progressionKey()),
            )) {
              expect(previous[lineage]?.toJSON()).toEqual(
                history.find((x) => x.progressionKey() === lineage)?.toJSON(),
              );
            }
          }
        } finally {
          forget(...sessions);
        }
      }),
    );
  });
});

describe('readPreviousComparableSession', () => {
  let db: ExpoSQLiteDatabase;
  const store = (...sessions: Session[]) =>
    db.transaction((tx) => sessions.forEach((session) => writeSession(tx, session)));

  beforeEach(async () => {
    db = await createDb();
  });

  it('finds the latest session of the same name performed before the given time', () => {
    const current = sessionOf('Push', [squatAt(tickAt(12, 0))]);
    const previous = sessionOf('Push', [squatAt(tickAt(10, 0))]);
    store(
      current,
      sessionOf('Push', [squatAt(tickAt(9, 0))]),
      previous,
      sessionOf('Pull', [squatAt(tickAt(11, 0))]),
      sessionOf('Push', [squatAt(tickAt(13, 0))]),
    );

    const found = readPreviousComparableSession(db, { id: current.id, name: 'Push', before: tickAt(12, 0) });

    expect(found?.id).toBe(previous.id);
  });

  it('places a session with nothing completed at the start of its date', () => {
    const untouched = sessionOf('Push', [], LocalDate.of(2025, 4, 4));
    store(untouched, sessionOf('Push', [], LocalDate.of(2025, 4, 6)));

    const found = readPreviousComparableSession(db, {
      id: uuid(),
      name: 'Push',
      before: LocalDate.of(2025, 4, 5).atStartOfDay().atZone(ZoneId.systemDefault()).toOffsetDateTime(),
    });

    expect(found?.id).toBe(untouched.id);
  });
});

describe('reading previous performances across exercise types', () => {
  it('keeps a weighted and a cardio exercise of the same name apart', async () => {
    const db = await createDb();
    const cardioBlueprint = new CardioExerciseBlueprint('New Exercise', [CardioExerciseSetBlueprint.empty()], '', '');
    const cardioExercise = RecordedCardioExercise.empty(cardioBlueprint).with({
      sets: RecordedCardioExercise.empty(cardioBlueprint).sets.map((set) =>
        set.with({ completionDateTime: tickAt(10, 0), duration: Duration.ofSeconds(45) }),
      ),
    });
    db.transaction((tx) => writeSession(tx, sessionOf('Freeform Workout', [cardioExercise])));
    const weightedKey = movementKeyFor('New Exercise', 'WeightedExerciseBlueprint');
    const cardioKey = movementKeyFor('New Exercise', 'CardioExerciseBlueprint');

    const weightedLineage = makeWeightedBlueprint({ name: 'New Exercise' }).progressionKey();
    const cardioLineage = cardioExercise.progressionKey();
    const previous = readPreviousExercises(db, [weightedLineage, cardioLineage], uuid());

    expect(readExerciseHistory(db, weightedKey)).toEqual([]);
    expect(readExerciseHistory(db, cardioKey)).toHaveLength(1);
    expect(previous[weightedLineage]).toBeUndefined();
    expect(previous[cardioLineage]).toBeInstanceOf(RecordedCardioExercise);
  });
});

describe('aggregating effective weight in SQL', () => {
  let db: ExpoSQLiteDatabase;
  const store = (...sessions: Session[]) =>
    db.transaction((tx) => sessions.forEach((session) => writeSession(tx, session)));
  const forget = (...sessions: Session[]) =>
    db.transaction((tx) => sessions.forEach((session) => deleteSession(tx, session.id)));
  const closeTo = (actual: number | undefined, expected: number) =>
    expect(Math.abs((actual ?? NaN) - expected)).toBeLessThanOrEqual(1e-9 * Math.max(1, Math.abs(expected)));
  const generatedSessions = fc
    .uniqueArray(SessionGenerator, { selector: (x) => x.id, maxLength: 4 })
    .map((sessions) => sessions.map(canonical));

  beforeEach(async () => {
    db = await createDb();
  });

  it('moves the same kilograms as sessionVolume, for every started session', () => {
    fc.assert(
      fc.property(generatedSessions, (sessions) => {
        store(...sessions);
        try {
          const volumes = new Map(readStartedSessionVolumes(db).map((x) => [x.id, x.volumeKg]));
          const started = sessions.filter((x) => x.isStarted);

          expect([...volumes.keys()].sort()).toEqual(started.map((x) => x.id).sort());
          started.forEach((session) => closeTo(volumes.get(session.id), sessionVolume(session)));
        } finally {
          forget(...sessions);
        }
      }),
    );
  });

  it('finds the same records as findPersonalRecords', () => {
    fc.assert(
      fc.property(generatedSessions, (sessions) => {
        store(...sessions);
        try {
          const expected = findPersonalRecords(
            [...sessions].sort((a, b) => TemporalComparer(getSessionReferenceTime(a), getSessionReferenceTime(b))),
          );

          expect(
            readPersonalRecords(db)
              .map((x) => `${x.sessionId}:${x.exerciseName}`)
              .sort(),
          ).toEqual([...expected].flatMap(([id, records]) => records.map((x) => `${id}:${x.exerciseName}`)).sort());
        } finally {
          forget(...sessions);
        }
      }),
    );
  });

  it('counts only the added weight of a bodyweight exercise when no bodyweight was recorded', () => {
    const pullUp = makeWeightedBlueprint({ name: 'Pull up', resistance: 'bodyweight' });
    const weighed = sessionOf('Weighed', [
      makeRecordedExercise(pullUp, [10], new Weight(22.0462, 'pounds'), () => tickAt(9, 0)),
    ]).with({ bodyweight: new Weight(80, 'kilograms') });
    const unweighed = sessionOf('Unweighed', [
      makeRecordedExercise(pullUp, [10], new Weight(10, 'kilograms'), () => tickAt(10, 0)),
    ]);
    store(weighed, unweighed);

    const volumes = new Map(readStartedSessionVolumes(db).map((x) => [x.id, x.volumeKg]));

    closeTo(volumes.get(weighed.id), 900);
    closeTo(volumes.get(unweighed.id), 100);
  });

  it('leaves the workout in progress out of both', () => {
    const before = sessionOf('Push', [squatAt(tickAt(9, 0), 100)]);
    const inProgress = sessionOf('Push', [squatAt(tickAt(10, 0), 200)]);
    store(before);
    db.transaction((tx) => setActiveSession(tx, inProgress));

    expect(readStartedSessionVolumes(db).map((x) => x.id)).toEqual([before.id]);
    expect(readPersonalRecords(db)).toEqual([]);
  });

  it('follows a session that is written again', () => {
    const before = sessionOf('Push', [squatAt(tickAt(9, 0), 100)]);
    const after = sessionOf('Push', [squatAt(tickAt(10, 0), 110)]);
    store(before, after);
    expect(readPersonalRecords(db).map((x) => x.sessionId)).toEqual([after.id]);

    store(after.with({ recordedExercises: [squatAt(tickAt(10, 0), 90)] }));
    expect(readPersonalRecords(db)).toEqual([]);
    closeTo(new Map(readStartedSessionVolumes(db).map((x) => [x.id, x.volumeKg])).get(after.id), 900);

    store(after.with({ recordedExercises: [makeRecordedExercise(makeWeightedBlueprint(), [undefined])] }));
    expect(readStartedSessionVolumes(db).map((x) => x.id)).toEqual([before.id]);
  });
});

process.env.TZ = 'Australia/Sydney';

import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { isDeepStrictEqual } from 'node:util';
import { gunzipSync } from 'node:zlib';
import { DayOfWeek, Duration, LocalDate, OffsetDateTime } from '@js-joda/core';
import BigNumber from 'bignumber.js';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { deserializeDatabaseAsync } from 'expo-sqlite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { RecordedExercise, Session } from '@/models/session-models';
import { AnyVersionSessionJSON } from '@/models/storage/versions/any';
import { sessionMigrations } from '@/models/storage/versions/migrations';
import { Weight } from '@/models/weight';
import { sessionVolume } from '@/store/activity';
import { getSessionReferenceTime } from '@/store/stored-sessions';
import {
  FixtureSource,
  openRegressionFixture,
  regressionBackupPath,
  RegressionFixture,
} from '@/utils/__test__/storage-regression-harness';

const today = LocalDate.parse('2026-10-07');

const storedSessionsTable = sqliteTable('session', {
  id: text().primaryKey(),
  payload: text({ mode: 'json' }).$type<AnyVersionSessionJSON>().notNull(),
});

async function readSessionsAsStored(): Promise<ReturnType<Session['toJSON']>[]> {
  const expoDb = await deserializeDatabaseAsync(gunzipSync(await readFile(regressionBackupPath)));
  try {
    const rows = await drizzle(expoDb).select().from(storedSessionsTable);
    return rows.map((row) => Session.fromJSON(sessionMigrations.migrate(row.payload)).toJSON());
  } finally {
    await expoDb.closeAsync();
  }
}

const unitLabels: Record<Weight['unit'], string> = { kilograms: 'kg', pounds: 'lb', nil: '' };

const short = (id: string) => id.slice(0, 8);
const rounded = (value: number) => Math.round(value * 1000) / 1000;
const instant = (time: OffsetDateTime | undefined) => time?.toInstant().toString() ?? '-';
const weight = (value: Weight | undefined) => (value ? `${value.value.toFixed()}${unitLabels[value.unit]}` : '-');
const digest = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 12);
const asPlainJSON = (value: unknown): unknown => JSON.parse(JSON.stringify(value));

function plain(value: unknown): unknown {
  if (value instanceof Weight) {
    return weight(value);
  }
  if (BigNumber.isBigNumber(value)) {
    return value.toFixed();
  }
  if (value instanceof OffsetDateTime) {
    return instant(value);
  }
  if (value instanceof LocalDate || value instanceof Duration) {
    return value.toString();
  }
  if (typeof value === 'number') {
    return rounded(value);
  }
  if (Array.isArray(value)) {
    return value.map(plain);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, field]) => [key, plain(field)]));
  }
  return value;
}

function describeExercise(exercise: RecordedExercise | undefined): string {
  if (!exercise) {
    return '-';
  }
  const sets =
    exercise.type === 'RecordedWeightedExercise'
      ? exercise.potentialSets
          .map((set) => `${weight(set.weight)}x${set.set?.repsCompleted ?? '_'}/${set.target.min}-${set.target.max}`)
          .join(' ')
      : `cardio ${exercise.sets.filter((set) => set.completionDateTime).length}/${exercise.sets.length}`;
  return `${exercise.blueprint.name} @${instant(exercise.latestTime)} ${sets} #${digest(exercise.toJSON())}`;
}

const matchesSnapshot = (value: unknown, name: string) =>
  expect(value).toMatchFileSnapshot(`__snapshots__/storage-regression/${name}.snap`);

const referenceMs = (session: Session) => getSessionReferenceTime(session).toInstant().toEpochMilli();
const byReferenceTime = (a: Session, b: Session) => referenceMs(a) - referenceMs(b) || a.id.localeCompare(b.id);

for (const source of ['migrated', 'restored'] satisfies FixtureSource[]) {
  describe(`the regression backup, ${source}`, { timeout: 120_000 }, () => {
    let fixture: RegressionFixture;
    let sessionsInOrder: Session[];

    beforeAll(async () => {
      fixture = await openRegressionFixture(source);
      sessionsInOrder = [...fixture.sessions].sort(byReferenceTime);
    }, 120_000);

    afterAll(async () => {
      await fixture?.close();
    });

    it('keeps every session, program and exercise', async () => {
      const exercises = fixture.sessions.flatMap((session) => session.recordedExercises);
      const weightedSets = exercises.flatMap((exercise) =>
        exercise.type === 'RecordedWeightedExercise' ? exercise.potentialSets : [],
      );
      const cardioSets = exercises.flatMap((exercise) =>
        exercise.type === 'RecordedCardioExercise' ? exercise.sets : [],
      );
      const dates = fixture.sessions.map((session) => session.date.toString()).sort();

      await matchesSnapshot(
        {
          sessions: fixture.sessions.length,
          startedSessions: fixture.sessions.filter((session) => session.isStarted).length,
          freeformSessions: fixture.sessions.filter((session) => session.isFreeform).length,
          sessionsWithBodyweight: fixture.sessions.filter((session) => session.bodyweight).length,
          activeSessionId: fixture.activeSessionId ?? null,
          firstDate: dates.at(0),
          lastDate: dates.at(-1),
          recordedExercises: exercises.length,
          exercisesWithNotes: exercises.filter((exercise) => exercise.notes).length,
          weightedSets: weightedSets.length,
          completedWeightedSets: weightedSets.filter((set) => set.set).length,
          repsCompleted: weightedSets.reduce((total, set) => total + (set.set?.repsCompleted ?? 0), 0),
          cardioSets: cardioSets.length,
          completedCardioSets: cardioSets.filter((set) => set.completionDateTime).length,
          movementKeys: new Set(exercises.map((exercise) => exercise.movementKey())).size,
          progressionKeys: new Set(exercises.map((exercise) => exercise.progressionKey())).size,
          programs: Object.keys(fixture.programs).length,
          activeProgramId: fixture.activeProgramId ?? null,
          exerciseDescriptors: Object.keys(fixture.exercises).length,
        },
        'counts',
      );
    });

    it('reads every session back exactly as the backup stored it', async () => {
      const stored = new Map((await readSessionsAsStored()).map((json) => [json.id, asPlainJSON(json)]));
      const read = new Map(fixture.sessions.map((session) => [session.id, asPlainJSON(session.toJSON())]));

      expect([...read.keys()].sort()).toEqual([...stored.keys()].sort());
      const differing = [...stored].filter(([id, json]) => !isDeepStrictEqual(read.get(id), json)).map(([id]) => id);
      if (differing.length) {
        expect(read.get(differing[0]!)).toEqual(stored.get(differing[0]!));
      }
      expect(differing).toEqual([]);
    });

    it('summarises every session the same way', async () => {
      await matchesSnapshot(
        sessionsInOrder.map((session) => {
          const weightedSets = session.recordedExercises.flatMap((exercise) =>
            exercise.type === 'RecordedWeightedExercise' ? exercise.potentialSets : [],
          );
          return [
            `${session.date.toString()} ${short(session.id)} ${session.blueprint.name}`,
            `exercises ${session.recordedExercises.length}`,
            `sets ${weightedSets.filter((set) => set.set).length}/${weightedSets.length}`,
            `volume ${rounded(sessionVolume(session))}`,
            `bodyweight ${weight(session.bodyweight)}`,
            `at ${instant(getSessionReferenceTime(session))}`,
          ].join(' | ');
        }),
        'sessions',
      );
    });

    it('finds the same personal records', async () => {
      await matchesSnapshot(
        fixture
          .personalRecords()
          .sort((a, b) => a.sessionId.localeCompare(b.sessionId) || a.exerciseName.localeCompare(b.exerciseName))
          .map((record) => `${short(record.sessionId)} ${record.exerciseName} ${rounded(record.oneRepMaxKg)}kg`),
        'personal-records',
      );
    });

    it('builds the same activity calendar and streak', async () => {
      const history = fixture.ownHistory(DayOfWeek.MONDAY, today);

      await matchesSnapshot(
        {
          startedSessionVolumes: history.startedSessionVolumes
            .sort((a, b) => a.id.localeCompare(b.id))
            .map((session) => `${short(session.id)} ${rounded(session.volumeKg)}`),
          days: [...history.days]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, day]) => `${date} ${day.sessionCount} ${rounded(day.volume)}`),
          volumeScale: plain(history.volumeScale),
          streakFromMonday: history.streak,
          streakFromSunday: fixture.ownHistory(DayOfWeek.SUNDAY, today).streak,
        },
        'activity',
      );
    });

    it('picks the same latest performance of each lineage', async () => {
      const progressionKeys = [
        ...new Set([
          ...fixture.sessions.flatMap((session) => session.recordedExercises.map((x) => x.progressionKey())),
          ...Object.values(fixture.programs).flatMap((program) =>
            program.sessions.flatMap((session) => session.exercises.map((x) => x.progressionKey())),
          ),
        ]),
      ].sort();
      const latest = fixture.latestExercises(progressionKeys);

      await matchesSnapshot(
        progressionKeys.map((key) => `${key} => ${describeExercise(latest[key])}`),
        'latest-exercises',
      );
    });

    it('picks the same previous performance of each exercise in every session', async () => {
      await matchesSnapshot(
        sessionsInOrder.map((session) => {
          const previous = fixture.previousExercises(session);
          const performances = session.recordedExercises.map((exercise) => {
            const performance = previous[exercise.progressionKey()];
            return performance ? `${instant(performance.latestTime)}#${digest(performance.toJSON())}` : '-';
          });
          return `${short(session.id)} ${performances.join(' ')}`;
        }),
        'previous-exercises',
      );
    });

    it('lists the same history for every movement', async () => {
      const movementKeys = [
        ...new Set(fixture.sessions.flatMap((session) => session.recordedExercises.map((x) => x.movementKey()))),
      ].sort();

      await matchesSnapshot(
        movementKeys.map((key) => {
          const history = fixture.exerciseHistory(key);
          return `${key} => ${history.length} newest ${instant(history[0]?.latestTime)} #${digest(history.map((x) => x.toJSON()))}`;
        }),
        'exercise-history',
      );
    });

    it('compares every session with the same earlier one', async () => {
      await matchesSnapshot(
        sessionsInOrder.map((session) => {
          const previous = fixture.previousComparableSession(session);
          return `${short(session.id)} => ${previous ? short(previous.id) : '-'}`;
        }),
        'previous-comparable-session',
      );
    });

    it('calculates the same all-time stats', async () => {
      const stats = fixture.allTimeStats(today);

      await matchesSnapshot(
        {
          workoutsPerWeek: rounded(stats.workoutsPerWeek),
          setsPerWeek: rounded(stats.setsPerWeek),
          averageSessionLength: stats.averageSessionLength.toString(),
          maxWeightLiftedInAWorkout: plain(stats.maxWeightLiftedInAWorkout),
          heaviestLift: plain(stats.heaviestLift),
          bodyweight: digest(plain(stats.bodyweightStats)),
          sessions: stats.sessionStats.map((x) => `${x.title} #${digest(plain(x))}`),
          exercises: stats.weightedExerciseStats.map((x) => `${x.exerciseName} #${digest(plain(x))}`),
        },
        'stats',
      );
    });

    it('plans the same upcoming sessions for every program', async () => {
      const plans: Record<string, string[]> = {};
      for (const [id, program] of Object.entries(fixture.programs).sort(([a], [b]) => a.localeCompare(b))) {
        const upcoming = await fixture.upcomingSessions(id, program.sessions.length);
        plans[`${short(id)} ${program.name}`] = upcoming.flatMap((session) => [
          `${session.blueprint.name} bodyweight ${weight(session.bodyweight)}`,
          ...session.recordedExercises.map((exercise) => `  ${describeExercise(exercise)}`),
        ]);
      }

      await matchesSnapshot(plans, 'upcoming-sessions');
    });

    it('exports the same CSV', async () => {
      const csv = await fixture.exportCsv();
      const lines = csv.split('\r\n');

      await matchesSnapshot({ lines: lines.length, digest: digest(csv), head: lines.slice(0, 4) }, 'csv-export');
    });
  });
}

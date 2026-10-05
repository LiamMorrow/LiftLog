import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { gunzipSync } from 'node:zlib';
import { DayOfWeek, LocalDate } from '@js-joda/core';
import { drizzle, ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { deserializeDatabaseAsync, openDatabaseAsync, SQLiteDatabase } from 'expo-sqlite';
import { vi } from 'vitest';
import { exercisesSchema, programsSchema } from '@/db/schema';
import {
  readEarliestSessionDate,
  readExerciseHistory,
  readLatestExercises,
  readPersonalRecords,
  readPreviousComparableSession,
  readPreviousExercises,
  readSessions,
  readSessionsBetween,
  readStartedSessionVolumes,
  writeSession,
} from '@/db/sessions';
import { MovementKey, ProgramBlueprint, ProgressionKey } from '@/models/blueprint-models';
import { ExerciseDescriptor, fromExerciseDescriptorJSON } from '@/models/exercise-models';
import { RecordedExercise, Session } from '@/models/session-models';
import { exerciseDescriptorMigrations, programBlueprintMigrations } from '@/models/storage/versions/migrations';
import { DatabaseImportService } from '@/services/database-import-service';
import { DatabaseMigrationService } from '@/services/database-migration-service';
import { SessionService } from '@/services/session-service';
import { RootState } from '@/store';
import { StreakStats, VolumeScale } from '@/store/activity';
import { ownHistoryOf } from '@/store/activity/own-history';
import { exportPlainText, settingsReducer } from '@/store/settings';
import { addExportPlaintextEffects } from '@/store/settings/export-plaintext-effects';
import { GranularStatisticView } from '@/store/stats';
import { calculateStats } from '@/store/stats/calculate-stats';
import { getSessionReferenceTime } from '@/store/stored-sessions';
import { createAddEffectTestBed } from '@/utils/__test__/add-effect-testbed';
import { toRecord } from '@/utils/reduce';

export const regressionBackupPath = resolve(__dirname, 'export.liftlogbackup.20261007_121611.sqlite.gz');

export type FixtureSource = 'migrated' | 'restored';

export interface PersonalRecordKg {
  sessionId: string;
  exerciseName: string;
  oneRepMaxKg: number;
}

export interface OwnHistorySummary {
  startedSessionVolumes: { id: string; volumeKg: number }[];
  days: Map<string, { sessionCount: number; volume: number }>;
  volumeScale: VolumeScale | undefined;
  streak: StreakStats;
}

export interface RegressionFixture {
  sessions: Session[];
  activeSessionId: string | undefined;
  programs: Record<string, ProgramBlueprint>;
  activeProgramId: string | undefined;
  exercises: Record<string, ExerciseDescriptor>;
  latestExercises(progressionKeys: ProgressionKey[]): Record<ProgressionKey, RecordedExercise | undefined>;
  previousExercises(session: Session): Record<ProgressionKey, RecordedExercise | undefined>;
  exerciseHistory(movementKey: MovementKey): RecordedExercise[];
  previousComparableSession(session: Session): Session | undefined;
  personalRecords(): PersonalRecordKg[];
  ownHistory(firstDayOfWeek: DayOfWeek, today: LocalDate): OwnHistorySummary;
  allTimeStats(today: LocalDate): GranularStatisticView;
  upcomingSessions(programId: string, count: number): Promise<Session[]>;
  exportCsv(): Promise<string>;
  close(): Promise<void>;
}

const silentLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() } as never;

const untouchable = new Proxy(
  {},
  {
    get(_, property) {
      throw new Error(`A data migration ran against the regression backup and read ${String(property)}`);
    },
  },
) as never;

async function migrateRegressionBackup(): Promise<{ db: ExpoSQLiteDatabase; expoDb: SQLiteDatabase }> {
  const expoDb = await deserializeDatabaseAsync(gunzipSync(await readFile(regressionBackupPath)));
  const db = drizzle(expoDb);
  await new DatabaseMigrationService(
    db,
    silentLogger,
    new DatabaseImportService(db, untouchable, untouchable),
  ).migrate();
  return { db, expoDb };
}

async function restoreIntoFreshDatabase(source: ExpoSQLiteDatabase) {
  const expoDb = await openDatabaseAsync(':memory:');
  const db = drizzle(expoDb);
  await new DatabaseMigrationService(db, silentLogger, { importOldData: async () => {} }).migrate();
  const { sessions } = readSessions(source);
  db.transaction((tx) => sessions.forEach((session) => writeSession(tx, session)));
  for (const table of [programsSchema, exercisesSchema] as const) {
    const rows = await source.select().from(table);
    if (rows.length) {
      await db.insert(table).values(rows as never[]);
    }
  }
  return { db, expoDb };
}

export async function openRegressionFixture(source: FixtureSource): Promise<RegressionFixture> {
  const migrated = await migrateRegressionBackup();
  const { db, expoDb } = source === 'migrated' ? migrated : await restoreIntoFreshDatabase(migrated.db);
  if (source === 'restored') {
    await migrated.expoDb.closeAsync();
  }

  const { sessions, activeSessionId } = readSessions(db);
  const programRows = await db.select().from(programsSchema);
  const programs = programRows.reduce(
    toRecord(
      (row) => row.id,
      (row) => ProgramBlueprint.fromJSON(programBlueprintMigrations.migrate(row.payload)),
    ),
    {} as Record<string, ProgramBlueprint>,
  );
  const exercises = (await db.select().from(exercisesSchema)).reduce(
    toRecord(
      (row) => row.id,
      (row) => fromExerciseDescriptorJSON(exerciseDescriptorMigrations.migrate(row.payload)),
    ),
    {} as Record<string, ExerciseDescriptor>,
  );

  const state = {
    settings: { ...settingsReducer(undefined, { type: 'init' }), useImperialUnits: false },
  } as unknown as RootState;

  return {
    sessions,
    activeSessionId,
    programs,
    activeProgramId: programRows.find((row) => row.active)?.id,
    exercises,

    latestExercises: (progressionKeys) => readLatestExercises(db, progressionKeys),

    previousExercises: (session) =>
      readPreviousExercises(db, [...new Set(session.recordedExercises.map((x) => x.progressionKey()))], session.id),

    exerciseHistory: (movementKey) => readExerciseHistory(db, movementKey),

    previousComparableSession: (session) =>
      readPreviousComparableSession(db, {
        id: session.id,
        name: session.blueprint.name,
        before: getSessionReferenceTime(session),
      }),

    personalRecords: () => readPersonalRecords(db),

    ownHistory: (firstDayOfWeek, today) => {
      const startedSessionVolumes = readStartedSessionVolumes(db);
      const history = ownHistoryOf(startedSessionVolumes, readPersonalRecords(db), firstDayOfWeek, today);
      return {
        startedSessionVolumes: startedSessionVolumes.map(({ id, volumeKg }) => ({ id, volumeKg })),
        days: history.days,
        volumeScale: history.volumeScale,
        streak: history.streak,
      };
    },

    allTimeStats: (today) => {
      const from = readEarliestSessionDate(db)!;
      return calculateStats(readSessionsBetween(db, from, today), 'kilograms', { from, to: today });
    },

    upcomingSessions: async (programId, count) => {
      const upcoming: Session[] = [];
      for await (const session of new SessionService(db, () => state).getUpcomingSessions(
        programs[programId]!.sessions,
      )) {
        upcoming.push(session);
        if (upcoming.length === count) {
          break;
        }
      }
      return upcoming;
    },

    exportCsv: async () => {
      const exportBytes = vi.fn();
      const testBed = createAddEffectTestBed({ services: { db, fileExportService: { exportBytes } } });
      addExportPlaintextEffects(testBed.addEffect);
      await testBed.dispatchHandled(exportPlainText({ format: 'CSV' }));
      return new TextDecoder().decode(exportBytes.mock.calls[0]![1] as Uint8Array);
    },

    close: () => expoDb.closeAsync(),
  };
}

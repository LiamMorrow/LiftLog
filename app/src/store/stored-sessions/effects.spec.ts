import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LocalDate } from '@js-joda/core';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { openDatabaseAsync } from 'expo-sqlite';
import { eq } from 'drizzle-orm';
import { DatabaseMigrationService } from '@/services/database-migration-service';
import { applyStoredSessionsEffects } from '@/store/stored-sessions/effects';
import {
  initializeStoredSessionsStateSlice,
  putStoredSession,
  sessionFinished,
  setActiveSessionId,
  setStoredSessions,
  upsertStoredSessions,
} from '@/store/stored-sessions';
import { addUnpublishedSessionId } from '@/store/feed';
import { setStatsIsDirty } from '@/store/stats';
import { createAddEffectTestBed } from '@/utils/__test__/add-effect-testbed';
import { sessionsSchema } from '@/db/schema';
import { Session } from '@/models/session-models';
import { toJsonString } from '@/models/storage/versions/latest';
import type { RootState } from '@/store/store';

async function createTestDb(): Promise<ExpoSQLiteDatabase> {
  const expoDb = await openDatabaseAsync(':memory:');
  const db = drizzle(expoDb);
  await new DatabaseMigrationService(
    db,
    { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn(), time: timeStub } as never,
    { importOldData: async () => {} },
  ).migrate();
  return db;
}

function makeKvStore(initial: Record<string, string> = {}) {
  const store: Record<string, string> = { ...initial };
  return {
    getItem: vi.fn().mockImplementation((key: string) => Promise.resolve(store[key] ?? null)),
    getItemBytes: vi.fn().mockResolvedValue(null),
    setItem: vi.fn().mockImplementation((key: string, val: string) => {
      store[key] = val;
      return Promise.resolve();
    }),
    removeItem: vi.fn().mockImplementation((key: string) => {
      delete store[key];
      return Promise.resolve();
    }),
    raw: store,
  };
}

const timeStub = async (_: string, action: () => unknown) => action();

const logger = { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn(), time: timeStub };

describe('stored-sessions effects', () => {
  let db: ExpoSQLiteDatabase;

  beforeEach(async () => {
    db = await createTestDb();
  });

  function bed(options: { keyValueStore?: ReturnType<typeof makeKvStore>; state?: Partial<RootState> }) {
    const testBed = createAddEffectTestBed({
      initialState: {
        settings: { isHydrated: true, preferredLanguage: 'en', exportToHealthAggregator: false },
        storedSessions: { sessions: {}, activeSessionId: undefined },
        ...options.state,
      } as Partial<RootState>,
      services: {
        db,
        logger,
        keyValueStore: options.keyValueStore ?? makeKvStore(),
        healthExportService: { canExport: () => false },
      },
    });
    applyStoredSessionsEffects(testBed.addEffect);
    return testBed;
  }

  describe('the active session in SQLite', () => {
    it('persists content without ever claiming the active flag', async () => {
      const session = Session.freeformSession(LocalDate.of(2026, 4, 10), undefined);
      const testBed = bed({ state: { storedSessions: { sessions: { [session.id]: session } } } as Partial<RootState> });

      await testBed.dispatchHandled(putStoredSession(session));

      const [row] = await db.select().from(sessionsSchema).where(eq(sessionsSchema.id, session.id));
      expect(row).toBeDefined();
      expect(row!.active).toBe(false);
    });

    it('keeps exactly one row active as the workout changes', async () => {
      const first = Session.freeformSession(LocalDate.of(2026, 4, 10), undefined);
      const second = Session.freeformSession(LocalDate.of(2026, 4, 11), undefined);
      const sessions = { [first.id]: first, [second.id]: second };
      const testBed = bed({ state: { storedSessions: { sessions } } as Partial<RootState> });

      await testBed.dispatchHandled(setActiveSessionId(first.id));
      await testBed.dispatchHandled(setActiveSessionId(second.id));

      const active = (await db.select().from(sessionsSchema)).filter((x) => x.active);
      expect(active.map((x) => x.id)).toEqual([second.id]);
    });

    it('inserts the row itself, so it does not depend on the content write landing first', async () => {
      const session = Session.freeformSession(LocalDate.of(2026, 4, 10), undefined);
      const testBed = bed({ state: { storedSessions: { sessions: { [session.id]: session } } } as Partial<RootState> });

      await testBed.dispatchHandled(setActiveSessionId(session.id));

      const [row] = await db.select().from(sessionsSchema).where(eq(sessionsSchema.id, session.id));
      expect(row?.active).toBe(true);
    });

    it('clears the flag when the workout ends', async () => {
      const session = Session.freeformSession(LocalDate.of(2026, 4, 10), undefined);
      const testBed = bed({ state: { storedSessions: { sessions: { [session.id]: session } } } as Partial<RootState> });
      await testBed.dispatchHandled(setActiveSessionId(session.id));

      await testBed.dispatchHandled(setActiveSessionId(undefined));

      expect((await db.select().from(sessionsSchema)).filter((x) => x.active)).toHaveLength(0);
    });

    it('restored backups land inactive', async () => {
      const restored = Session.freeformSession(LocalDate.of(2026, 4, 10), undefined);
      const testBed = bed({});

      await testBed.dispatchHandled(upsertStoredSessions([restored]));

      const [row] = await db.select().from(sessionsSchema).where(eq(sessionsSchema.id, restored.id));
      expect(row?.active).toBe(false);
    });

    it('restoring a backup leaves a workout in progress on this device alone', async () => {
      const active = Session.freeformSession(LocalDate.of(2026, 4, 10), undefined);
      const testBed = bed({ state: { storedSessions: { sessions: { [active.id]: active } } } as Partial<RootState> });
      await testBed.dispatchHandled(setActiveSessionId(active.id));

      await testBed.dispatchHandled(upsertStoredSessions([active]));

      const [row] = await db.select().from(sessionsSchema).where(eq(sessionsSchema.id, active.id));
      expect(row?.active).toBe(true);
    });
  });

  describe('sessionFinished', () => {
    it('queues the session for the feed, clears the active pointer and marks stats dirty', async () => {
      const session = Session.freeformSession(LocalDate.of(2026, 4, 10), undefined);
      const testBed = bed({
        state: {
          storedSessions: { sessions: { [session.id]: session }, activeSessionId: session.id },
        } as Partial<RootState>,
      });

      await testBed.dispatchHandled(sessionFinished(session.id));

      expect(testBed.getDispatchedAction(addUnpublishedSessionId).payload).toBe(session.id);
      expect(testBed.getDispatchedAction(setStatsIsDirty).payload).toBe(true);
      expect(testBed.getDispatchedAction(setActiveSessionId).payload).toBeUndefined();
    });

    it('leaves the active pointer alone when finishing some other session', async () => {
      const active = Session.freeformSession(LocalDate.of(2026, 4, 10), undefined);
      const edited = Session.freeformSession(LocalDate.of(2026, 3, 1), undefined);
      const testBed = bed({
        state: {
          storedSessions: {
            sessions: { [active.id]: active, [edited.id]: edited },
            activeSessionId: active.id,
          },
        } as Partial<RootState>,
      });

      await testBed.dispatchHandled(sessionFinished(edited.id));

      testBed.expectNotDispatched(setActiveSessionId);
    });

    it('exports to the health aggregator exactly once, not once per recorded set', async () => {
      const session = Session.freeformSession(LocalDate.of(2026, 4, 10), undefined);
      const exportWorkout = vi.fn();
      const testBed = createAddEffectTestBed({
        initialState: {
          settings: { isHydrated: true, exportToHealthAggregator: true },
          storedSessions: { sessions: { [session.id]: session }, activeSessionId: session.id },
        } as Partial<RootState>,
        services: {
          db,
          logger,
          keyValueStore: makeKvStore(),
          healthExportService: { canExport: () => true, exportWorkout },
        },
      });
      applyStoredSessionsEffects(testBed.addEffect);

      await testBed.dispatchHandled(putStoredSession(session));
      await testBed.dispatchHandled(putStoredSession(session));
      expect(exportWorkout).not.toHaveBeenCalled();

      await testBed.dispatchHandled(sessionFinished(session.id));
      expect(exportWorkout).toHaveBeenCalledTimes(1);
    });
  });

  describe('migrating off CurrentSessionStateV1', () => {
    it('lifts a v3 in-progress workout into the table and marks it active', async () => {
      const session = Session.freeformSession(LocalDate.of(2026, 4, 10), undefined);
      const keyValueStore = makeKvStore({
        'CurrentSessionStateV1-Version': '3',
        CurrentSessionStateV1: toJsonString(session.toJSON()),
      });
      const testBed = bed({ keyValueStore });

      await testBed.dispatchHandled(initializeStoredSessionsStateSlice());

      expect(testBed.getDispatchedAction(putStoredSession).payload.id).toBe(session.id);
      expect(testBed.getDispatchedAction(setActiveSessionId).payload).toBe(session.id);
    });

    it('removes the legacy keys so it runs at most once', async () => {
      const session = Session.freeformSession(LocalDate.of(2026, 4, 10), undefined);
      const keyValueStore = makeKvStore({
        'CurrentSessionStateV1-Version': '3',
        CurrentSessionStateV1: toJsonString(session.toJSON()),
      });
      const testBed = bed({ keyValueStore });

      await testBed.dispatchHandled(initializeStoredSessionsStateSlice());

      expect(keyValueStore.raw.CurrentSessionStateV1).toBeUndefined();
      expect(keyValueStore.raw['CurrentSessionStateV1-Version']).toBeUndefined();
    });

    it('does nothing on a fresh install, where neither key exists', async () => {
      const keyValueStore = makeKvStore();
      const testBed = bed({ keyValueStore });

      await testBed.dispatchHandled(initializeStoredSessionsStateSlice());

      testBed.expectNotDispatched(putStoredSession);
      testBed.expectNotDispatched(setActiveSessionId);
    });

    it('restores the active session from the table on a later launch', async () => {
      const session = Session.freeformSession(LocalDate.of(2026, 4, 10), undefined);
      await db.insert(sessionsSchema).values({ id: session.id, active: true, payload: session.toJSON() });
      const testBed = bed({});

      await testBed.dispatchHandled(initializeStoredSessionsStateSlice());

      expect(Object.keys(testBed.getDispatchedAction(setStoredSessions).payload)).toEqual([session.id]);
      expect(testBed.getDispatchedAction(setActiveSessionId).payload).toBe(session.id);
    });
  });
});

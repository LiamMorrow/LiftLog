import { describe, it, expect, vi } from 'vitest';
import { LocalDate } from '@js-joda/core';
import { addStoredSession, setIsHydrated } from '@/store/stored-sessions';
import { applyStoredSessionsEffects } from '@/store/stored-sessions/effects';
import { createAddEffectTestBed } from '@/utils/__test__/add-effect-testbed';
import { RootState } from '@/store/store';
import { Session } from '@/models/session-models';
import { SessionBlueprint } from '@/models/blueprint-models';
import { uuid } from '@/utils/uuid';

const pendingHealthExportSessionIdsStorageKey = 'PendingHealthExportSessionIdList';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeSession(id: string = uuid()): Session {
  return new Session(id, new SessionBlueprint('Test', [], ''), [], LocalDate.of(2025, 4, 5), undefined, undefined);
}

function makeInMemoryKeyValueStore(initialItems?: Record<string, string>) {
  const store = new Map<string, string>(Object.entries(initialItems ?? {}));
  return {
    store,
    getItem: vi.fn((key: string) => Promise.resolve(store.get(key))),
    getItemBytes: vi.fn().mockResolvedValue(undefined),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
      return Promise.resolve();
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
      return Promise.resolve();
    }),
  };
}

function pendingIds(keyValueStore: ReturnType<typeof makeInMemoryKeyValueStore>): string[] {
  return JSON.parse(keyValueStore.store.get(pendingHealthExportSessionIdsStorageKey) ?? '[]') as string[];
}

function seededQueue(...ids: string[]): Record<string, string> {
  return { [pendingHealthExportSessionIdsStorageKey]: JSON.stringify(ids) };
}

function makeHealthExportService(overrides?: object) {
  return {
    canExport: vi.fn(() => true),
    exportWorkout: vi.fn().mockResolvedValue(undefined),
    deleteWorkout: vi.fn().mockResolvedValue(undefined),
    requestPermission: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function makeDb() {
  return {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        onConflictDoUpdate: vi.fn().mockResolvedValue(undefined),
      })),
    })),
  };
}

function makeLogger() {
  return {
    time: vi.fn((_name: string, fn: () => Promise<void>) => fn()),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  };
}

function exportingState(sessions: Session[], exportToHealthAggregator = true): Partial<RootState> {
  return {
    settings: { isHydrated: true, exportToHealthAggregator },
    storedSessions: { sessions: Object.fromEntries(sessions.map((s) => [s.id, s])) },
  } as Partial<RootState>;
}

function makeExportTestBed(options: {
  sessions?: Session[];
  exportToHealthAggregator?: boolean;
  healthExportService?: ReturnType<typeof makeHealthExportService>;
  keyValueStore?: ReturnType<typeof makeInMemoryKeyValueStore>;
}) {
  const healthExportService = options.healthExportService ?? makeHealthExportService();
  const keyValueStore = options.keyValueStore ?? makeInMemoryKeyValueStore();
  const logger = makeLogger();
  const testBed = createAddEffectTestBed({
    initialState: exportingState(options.sessions ?? [], options.exportToHealthAggregator ?? true),
    services: { healthExportService, keyValueStore, db: makeDb(), logger },
  });
  applyStoredSessionsEffects(testBed.addEffect);
  return { testBed, healthExportService, keyValueStore, logger };
}

describe('stored-sessions effects — health aggregator export', () => {
  // ─── addStoredSession ────────────────────────────────────────────────────────

  describe('addStoredSession', () => {
    it('exports the workout and leaves the pending queue empty on success', async () => {
      const session = makeSession();
      const { testBed, healthExportService, keyValueStore } = makeExportTestBed({ sessions: [session] });

      await testBed.dispatchHandled(addStoredSession(session));

      expect(healthExportService.exportWorkout).toHaveBeenCalledWith(session);
      expect(pendingIds(keyValueStore)).toEqual([]);
    });

    it('queues the workout id before attempting the export', async () => {
      const session = makeSession();
      const keyValueStore = makeInMemoryKeyValueStore();
      let queuedAtExportTime: string[] | undefined;
      const healthExportService = makeHealthExportService({
        exportWorkout: vi.fn(() => {
          queuedAtExportTime = pendingIds(keyValueStore);
          return Promise.resolve();
        }),
      });
      const { testBed } = makeExportTestBed({ sessions: [session], healthExportService, keyValueStore });

      await testBed.dispatchHandled(addStoredSession(session));

      expect(queuedAtExportTime).toEqual([session.id]);
    });

    it('keeps the workout id queued when the export throws', async () => {
      const session = makeSession();
      const healthExportService = makeHealthExportService({
        exportWorkout: vi.fn().mockRejectedValue(new Error('boom')),
      });
      const { testBed, keyValueStore, logger } = makeExportTestBed({ sessions: [session], healthExportService });

      await testBed.dispatchHandled(addStoredSession(session));

      expect(pendingIds(keyValueStore)).toEqual([session.id]);
      expect(logger.error).toHaveBeenCalledWith('Failed to sync to health aggregator', expect.any(Error));
    });

    it('does not queue the same workout twice across failed exports', async () => {
      const session = makeSession();
      const healthExportService = makeHealthExportService({
        exportWorkout: vi.fn().mockRejectedValue(new Error('boom')),
      });
      const { testBed, keyValueStore } = makeExportTestBed({ sessions: [session], healthExportService });

      await testBed.dispatchHandled(addStoredSession(session));
      await testBed.dispatchHandled(addStoredSession(session));

      expect(pendingIds(keyValueStore)).toEqual([session.id]);
    });

    it('does not export or queue when export to health aggregator is disabled', async () => {
      const session = makeSession();
      const { testBed, healthExportService, keyValueStore } = makeExportTestBed({
        sessions: [session],
        exportToHealthAggregator: false,
      });

      await testBed.dispatchHandled(addStoredSession(session));

      expect(healthExportService.exportWorkout).not.toHaveBeenCalled();
      expect(pendingIds(keyValueStore)).toEqual([]);
    });
  });

  // ─── setIsHydrated retry ─────────────────────────────────────────────────────

  describe('setIsHydrated retry', () => {
    it('re-exports queued sessions and clears them from the queue', async () => {
      const session = makeSession();
      const keyValueStore = makeInMemoryKeyValueStore(seededQueue(session.id));
      const { testBed, healthExportService } = makeExportTestBed({ sessions: [session], keyValueStore });

      await testBed.dispatchHandled(setIsHydrated(true));

      expect(healthExportService.exportWorkout).toHaveBeenCalledWith(session);
      expect(pendingIds(keyValueStore)).toEqual([]);
    });

    it('drops queued ids whose session no longer exists without exporting', async () => {
      const keyValueStore = makeInMemoryKeyValueStore(seededQueue('deleted-session-id'));
      const { testBed, healthExportService } = makeExportTestBed({ keyValueStore });

      await testBed.dispatchHandled(setIsHydrated(true));

      expect(healthExportService.exportWorkout).not.toHaveBeenCalled();
      expect(pendingIds(keyValueStore)).toEqual([]);
    });

    it('keeps a session queued when the retry throws', async () => {
      const session = makeSession();
      const keyValueStore = makeInMemoryKeyValueStore(seededQueue(session.id));
      const healthExportService = makeHealthExportService({
        exportWorkout: vi.fn().mockRejectedValue(new Error('boom')),
      });
      const { testBed } = makeExportTestBed({ sessions: [session], healthExportService, keyValueStore });

      await testBed.dispatchHandled(setIsHydrated(true));

      expect(pendingIds(keyValueStore)).toEqual([session.id]);
    });

    it('retries only the failing session and clears the rest', async () => {
      const failing = makeSession('failing-id');
      const succeeding = makeSession('succeeding-id');
      const keyValueStore = makeInMemoryKeyValueStore(seededQueue(failing.id, succeeding.id));
      const healthExportService = makeHealthExportService({
        exportWorkout: vi.fn((workout: Session) =>
          workout.id === failing.id ? Promise.reject(new Error('boom')) : Promise.resolve(),
        ),
      });
      const { testBed } = makeExportTestBed({ sessions: [failing, succeeding], healthExportService, keyValueStore });

      await testBed.dispatchHandled(setIsHydrated(true));

      expect(healthExportService.exportWorkout).toHaveBeenCalledTimes(2);
      expect(pendingIds(keyValueStore)).toEqual([failing.id]);
    });

    it('does nothing when hydration is set to false', async () => {
      const session = makeSession();
      const keyValueStore = makeInMemoryKeyValueStore(seededQueue(session.id));
      const { testBed, healthExportService } = makeExportTestBed({ sessions: [session], keyValueStore });

      await testBed.dispatchHandled(setIsHydrated(false));

      expect(healthExportService.exportWorkout).not.toHaveBeenCalled();
      expect(pendingIds(keyValueStore)).toEqual([session.id]);
    });

    it('leaves the queue untouched when export to health aggregator is disabled', async () => {
      const session = makeSession();
      const keyValueStore = makeInMemoryKeyValueStore(seededQueue(session.id));
      const { testBed, healthExportService } = makeExportTestBed({
        sessions: [session],
        keyValueStore,
        exportToHealthAggregator: false,
      });

      await testBed.dispatchHandled(setIsHydrated(true));

      expect(healthExportService.exportWorkout).not.toHaveBeenCalled();
      expect(pendingIds(keyValueStore)).toEqual([session.id]);
    });
  });
});

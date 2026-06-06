import { describe, it, expect, vi } from 'vitest';
import {
  initializeCurrentSessionStateSlice,
  setCurrentSession,
  setIsHydrated,
  currentWorkoutSessionUpdated,
} from '@/store/current-session';
import { RootState } from '@/store/store';
import { applyCurrentSessionEffects } from '@/store/current-session/effects';
import { createAddEffectTestBed } from '@/utils/__test__/add-effect-testbed';
import { EmptySession } from '@/models/session-models';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeKeyValueStore(
  overrides?: Partial<ReturnType<typeof defaultKvStore>>,
) {
  return { ...defaultKvStore(), ...overrides };
}

function defaultKvStore() {
  return {
    getItem: vi.fn().mockResolvedValue(null),
    getItemBytes: vi.fn().mockResolvedValue(null),
    setItem: vi.fn().mockResolvedValue(undefined),
    removeItem: vi.fn().mockResolvedValue(undefined),
  };
}

const hydratedSettingsState = {
  settings: { isHydrated: true },
} as Partial<RootState>;

describe('current-session effects', () => {
  // ─── initializeCurrentSessionStateSlice ──────────────────────────────────────

  describe('applyCurrentSessionEffects — initializeCurrentSessionStateSlice', () => {
    it('dispatches setIsHydrated(true) when there is no stored session', async () => {
      const testBed = createAddEffectTestBed({
        initialState: hydratedSettingsState,
        services: { keyValueStore: makeKeyValueStore() },
      });
      applyCurrentSessionEffects(testBed.addEffect);

      await testBed.dispatchHandled(initializeCurrentSessionStateSlice());

      const action = testBed.getDispatchedAction(setIsHydrated);
      expect(action.payload).toBe(true);
    });

    it('throws and logs if settings are not yet hydrated', async () => {
      const testBed = createAddEffectTestBed({
        initialState: { settings: { isHydrated: false } },
        services: { keyValueStore: makeKeyValueStore() },
      });
      applyCurrentSessionEffects(testBed.addEffect);

      await testBed.dispatchHandled(initializeCurrentSessionStateSlice());

      testBed.expectNotDispatched(setIsHydrated);
    });

    it('dispatches setIsHydrated(true) when version key is missing (defaults to v2 path with empty bytes)', async () => {
      const kvStore = makeKeyValueStore({
        getItem: vi.fn().mockImplementation((key: string) => {
          if (key === 'CurrentSessionStateV1-Version')
            return Promise.resolve(null);
          return Promise.resolve(null);
        }),
        getItemBytes: vi.fn().mockResolvedValue(new Uint8Array()),
      });
      const testBed = createAddEffectTestBed({
        initialState: hydratedSettingsState,
        services: { keyValueStore: kvStore },
      });
      applyCurrentSessionEffects(testBed.addEffect);

      await testBed.dispatchHandled(initializeCurrentSessionStateSlice());

      const action = testBed.getDispatchedAction(setIsHydrated);
      expect(action.payload).toBe(true);
    });

    it('dispatches setIsHydrated(true) on v3 path with null stored value', async () => {
      const kvStore = makeKeyValueStore({
        getItem: vi.fn().mockImplementation((key: string) => {
          if (key === 'CurrentSessionStateV1-Version')
            return Promise.resolve('3');
          if (key === 'CurrentSessionStateV1') return Promise.resolve(null);
          return Promise.resolve(null);
        }),
      });
      const testBed = createAddEffectTestBed({
        initialState: hydratedSettingsState,
        services: { keyValueStore: kvStore },
      });
      applyCurrentSessionEffects(testBed.addEffect);

      await testBed.dispatchHandled(initializeCurrentSessionStateSlice());

      const action = testBed.getDispatchedAction(setIsHydrated);
      expect(action.payload).toBe(true);
    });

    it('logs and rethrows if keyValueStore throws', async () => {
      const kvStore = makeKeyValueStore({
        getItem: vi.fn().mockRejectedValue(new Error('storage failure')),
      });
      const testBed = createAddEffectTestBed({
        initialState: hydratedSettingsState,
        services: { keyValueStore: kvStore },
      });
      applyCurrentSessionEffects(testBed.addEffect);

      await testBed.dispatchHandled(initializeCurrentSessionStateSlice());

      expect(testBed.mockServices.logger.error).toHaveBeenCalledWith(
        'Failed to initialize current session state',
        expect.objectContaining({ message: 'storage failure' }),
      );
      testBed.expectNotDispatched(setIsHydrated);
    });
  });

  // ─── setCurrentSession ────────────────────────────────────────────────────────

  describe('applyCurrentSessionEffects — setCurrentSession', () => {
    it('persists to keyValueStore when hydrated and session state changed', async () => {
      const kvStore = makeKeyValueStore();
      const testBed = createAddEffectTestBed({
        initialState: {
          currentSession: {
            isHydrated: true,
            workoutSession: undefined,
            historySession: undefined,
          },
        },
        services: { keyValueStore: kvStore },
      });
      applyCurrentSessionEffects(testBed.addEffect);

      // setState simulates the reducer having run — stateAfterReduce differs from stateBeforeReduce
      testBed.setStateBeforeReduce({
        currentSession: {
          isHydrated: true,
          workoutSession: EmptySession,
          historySession: undefined,
        },
      });

      await testBed.dispatchHandled(
        setCurrentSession({ target: 'workoutSession', session: undefined }),
      );

      expect(kvStore.setItem).toHaveBeenCalledWith(
        'CurrentSessionStateV1-Version',
        '3',
      );
      expect(kvStore.removeItem).toHaveBeenCalledWith('CurrentSessionStateV1');
    });

    it('does not persist when not yet hydrated', async () => {
      const kvStore = makeKeyValueStore();
      const testBed = createAddEffectTestBed({
        initialState: {
          currentSession: {
            isHydrated: false,
            workoutSession: undefined,
            historySession: undefined,
          },
        },
        services: { keyValueStore: kvStore },
      });
      applyCurrentSessionEffects(testBed.addEffect);

      await testBed.dispatchHandled(
        setCurrentSession({ target: 'workoutSession', session: undefined }),
      );

      expect(kvStore.setItem).not.toHaveBeenCalled();
    });

    it('dispatches currentWorkoutSessionUpdated when workoutSession changes', async () => {
      const before = EmptySession;
      const after = before.with({ id: '1234' });
      const testBed = createAddEffectTestBed({
        initialState: {
          currentSession: {
            isHydrated: true,
            workoutSession: before,
            historySession: undefined,
          },
        },
        services: { keyValueStore: makeKeyValueStore() },
      });
      applyCurrentSessionEffects(testBed.addEffect);

      testBed.setState({
        currentSession: {
          isHydrated: true,
          workoutSession: after,
          historySession: undefined,
        },
      });

      await testBed.dispatchHandled(
        setCurrentSession({ target: 'workoutSession', session: after }),
      );

      const action = testBed.getDispatchedAction(currentWorkoutSessionUpdated);
      expect(action.payload.before).toBe(before);
      expect(action.payload.after).toBe(after);
    });

    it('does not dispatch currentWorkoutSessionUpdated when workoutSession is unchanged', async () => {
      const session = EmptySession;
      const testBed = createAddEffectTestBed({
        initialState: {
          currentSession: {
            isHydrated: true,
            workoutSession: session,
            historySession: undefined,
          },
        },
        services: { keyValueStore: makeKeyValueStore() },
      });
      applyCurrentSessionEffects(testBed.addEffect);

      // stateAfterReduce same as original — no change
      await testBed.dispatchHandled(
        setCurrentSession({ target: 'workoutSession', session }),
      );

      testBed.expectNotDispatched(currentWorkoutSessionUpdated);
    });

    it('logs but does not rethrow if persist fails', async () => {
      const kvStore = makeKeyValueStore({
        setItem: vi.fn().mockRejectedValue(new Error('disk full')),
      });
      const testBed = createAddEffectTestBed({
        initialState: {
          currentSession: {
            isHydrated: true,
            workoutSession: undefined,
            historySession: undefined,
          },
        },
        services: { keyValueStore: kvStore },
      });
      applyCurrentSessionEffects(testBed.addEffect);

      testBed.setState({
        currentSession: {
          isHydrated: true,
          workoutSession: { id: 'new' },
          historySession: undefined,
        },
      });

      await expect(
        testBed.dispatchHandled(
          setCurrentSession({ target: 'workoutSession', session: undefined }),
        ),
      ).resolves.not.toThrow();

      expect(testBed.mockServices.logger.error).toHaveBeenCalledWith(
        'Failed to persist current session state',
        expect.objectContaining({ message: 'disk full' }),
      );
    });
  });
});
